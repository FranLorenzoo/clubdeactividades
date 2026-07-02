import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { sendWaitingListPromotionEmail } from "@/lib/email/waitingListPromotion";

export async function getAllUserAppointments() {
  return prisma.userAppointment.findMany({
    include: { appointment: true, client: true, payments: true, qr: true },
  });
}

export async function getUserAppointmentById(id: number) {
  return prisma.userAppointment.findUnique({
    where: { id },
    include: { appointment: true, client: true, payments: true, qr: true },
  });
}

export async function createUserAppointment(data: Prisma.userAppointmentCreateInput) {
  return prisma.userAppointment.create({ data });
}

export async function updateUserAppointment(id: number, data: Prisma.userAppointmentUpdateInput) {
  return prisma.userAppointment.update({ where: { id }, data });
}

export async function deleteUserAppointment(id: number) {
  return prisma.userAppointment.delete({ where: { id } });
}

export async function getUserAppointmentsByClientId(clientId: number) {
  return prisma.userAppointment.findMany({
    where: { clientId },
    include: {
      appointment: {
        include: {
          activity: true,
          userAppointments: {
            orderBy: [{ reservationDate: "asc" }, { id: "asc" }],
          },
        },
      },
      client: true,
      payments: true,
      qr: true,
    },
  });
}

export async function getUserAppointmentsByAppointmentId(appointmentId: number) {
  return prisma.userAppointment.findMany({
    where: { appointmentId },
    include: { appointment: true, client: true, payments: true, qr: true },
  });
}

export async function getOverdueImpagoCountByClientId(clientId: number) {
  const overdueUas = await prisma.userAppointment.findMany({
    where: {
      clientId,
      state: "IMPAGO",
      appointment: { initialDate: { lt: new Date() } },
    },
    include: {
      appointment: {
        include: {
          userAppointments: {
            select: { id: true, reservationDate: true },
            orderBy: [{ reservationDate: "asc" }, { id: "asc" }],
          },
        },
      },
    },
  });

  return overdueUas.filter((ua) => {
    const capacity = ua.appointment.slotsAvailable ?? 0;
    const queue = ua.appointment.userAppointments;
    const index = queue.findIndex((item) => item.id === ua.id);
    return index === -1 || index < capacity;
  }).length;
}

export async function cancelOverdueAbonadosForClient(clientId: number) {
  const now = new Date();

  const candidates = await prisma.userAppointment.findMany({
    where: {
      clientId,
      type: "ABONADO",
      state: "IMPAGO",
    },
    select: {
      id: true,
      appointment: { select: { initialDate: true } },
    },
  });

  const toCancel = candidates
    .filter((ua) => {
      const apptDate = new Date(ua.appointment.initialDate);
      const cutoff = new Date(Date.UTC(apptDate.getUTCFullYear(), apptDate.getUTCMonth(), 11));
      return now >= cutoff;
    })
    .map((ua) => ua.id);

  if (toCancel.length === 0) return { cancelled: 0 };

  const result = await prisma.userAppointment.updateMany({
    where: { id: { in: toCancel } },
    data: { state: "CANCELLED", cancellationDate: now },
  });

  return { cancelled: result.count };
}

export async function cancelUserAppointment(userAppointmentId: number) {
  // Toda la operación corre empaquetada de manera atómica
  return prisma.$transaction(async (tx) => {
    
    // 1. Obtener la inscripción con su turno
    const ua = await tx.userAppointment.findUnique({
      where: { id: userAppointmentId },
      include: {
        appointment: true,  
        client: true,
      },
    });

    if (!ua || ua.state === "CANCELLED" || ua.rejected) {
      throw new Error("La inscripción no existe o ya se encuentra cancelada");
    }

    const now = new Date();
    const appointmentDate = new Date(ua.appointment.initialDate);
    const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    const isAbonado = ua.type === "ABONADO";
    let creditCreated = false;

    // 🟢 CASO ABONADO + 48HS → CREA CRÉDITO
    if (
  isAbonado && ua.state === "PAGO_COMPLETO" && hoursDiff >= 48) {
      await tx.credit.create({
        data: {
          clientId: ua.clientId,
          activityId: ua.appointment.activityId,
          endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          isValid: true,
        },
      });
      creditCreated = true;
    }

    // 🟡 CASO NO ABONADO + 24HS → Devolución manual flag
    const refundPending = !isAbonado && hoursDiff >= 24;

    // 🔍 Obtener todas las inscripciones vigentes ordenadas para validar cupo real vs lista de espera
    const activeBefore = await tx.userAppointment.findMany({
      where: {
        appointmentId: ua.appointmentId,
        rejected: false,
        state: { not: "CANCELLED" },
      },
      orderBy: [{ reservationDate: "asc" }, { id: "asc" }],
    });

    const capacity = ua.appointment.slotsAvailable;
    const cancelledIndex = activeBefore.findIndex((u) => u.id === userAppointmentId);
    
    // Determinar si el usuario estaba dentro del cupo máximo o estaba esperando
    const wasInSlot = cancelledIndex >= 0 && cancelledIndex < capacity;

    // ❌ Marcar cancelación efectiva e indicar que ya no cuenta para las métricas (rejected: true)
    await tx.userAppointment.update({
      where: { id: userAppointmentId },
      data: {
        cancellationDate: now,
        state:
          isAbonado &&
          ua.state === "IMPAGO" &&
          hoursDiff < 48
            ? "IMPAGO"
            : "CANCELLED",
        rejected: true,
      },
    });

    let promotedUserAppointmentId: number | null = null;

    if (wasInSlot) {
      // Los que están del índice de capacidad en adelante forman la lista de espera
      const waitingList = activeBefore.slice(capacity);

      // Prioridad: Si cancela un ABONADO, busca otro ABONADO en espera. Si no, va al primero.
      const promoted = isAbonado
        ? waitingList.find((w) => w.type === "ABONADO") ?? waitingList[0]
        : waitingList[0];

      if (promoted) {
        // Al promoverse, hereda la fecha de reserva del que se acaba de ir para mantener el orden
        await tx.userAppointment.update({
          where: { id: promoted.id },
          data: { reservationDate: ua.reservationDate },
        });
        
        promotedUserAppointmentId = promoted.id;

        const promotedUa = await tx.userAppointment.findUnique({
          where: { id: promoted.id },
          include: {
            client: { include: { user: true } },
            appointment: { include: { activity: true } },
          },
        });

        if (promotedUa?.client.user.email) {
          // Enviar correo de notificación asincrónico (fuera o dentro del hilo según prefieras)
          sendWaitingListPromotionEmail({
            email: promotedUa.client.user.email,
            name: promotedUa.client.user.name,
            activityName: promotedUa.appointment.activity?.name ?? "tu actividad",
            initialDate: new Date(promotedUa.appointment.initialDate),
          }).catch(err => console.error("Error al enviar email:", err));
        }
      }
    }

    // 🔄 Si el usuario cancelado ocupaba cupo y NADIE tomó su lugar desde la espera:
    // Se libera una vacante incrementando currentSlots (cupos libres) en 1.
    if (wasInSlot && promotedUserAppointmentId === null) {
      await tx.appointment.update({
        where: { id: ua.appointmentId },
        data: {
          currentSlots: {
            increment: 1, // Corregido de decrement a increment para reflejar cupos vacios
          },
        },
      });
    }

    return {
      success: true,
      creditCreated,
      refundPending,
      promotedUserAppointmentId,
    };
  });
}

export async function suspendAppointmentAndRefundAll(appointmentId: number) {
  return prisma.$transaction(async (tx) => {
    
    const appointment = await tx.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        userAppointments: {
          include: { payments: true }
        }
      }
    });

    if (!appointment) {
      throw new Error("El turno a suspender no existe.");
    }

    const now = new Date();

    for (const userApp of appointment.userAppointments) {
      
      if (userApp.rejected || userApp.state === "CANCELLED") {
        continue;
      }

      if (userApp.type === "ABONADO") {
        await tx.credit.create({
          data: {
            clientId: userApp.clientId,
            activityId: appointment.activityId,
            endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            isValid: true,
          },
        });
      } else {
        // NO_ABONADO: Marcamos que requiere devolución manual de dinero (Efectivo/Tarjeta)
        // Aquí podrías agregar un registro en una tabla de "ReembolsosPendientes" si tuvieran una,
        // o simplemente procesar el log del dinero a reintegrar.
        const mainPayment = userApp.payments[0];
        console.log(`Generando reembolso mandatorio para Cliente ID ${userApp.clientId} por valor de $${mainPayment?.amount ?? appointment.price}`);
      }

      await tx.userAppointment.update({
        where: { id: userApp.id },
        data: {
          cancellationDate: now,
          state: "CANCELLED",
          rejected: true,
        },
      });
    }

    return tx.appointment.update({
      where: { id: appointmentId },
      data: {
        slotsAvailable: 0,
        currentSlots: 0,
      },
    });
  });
}