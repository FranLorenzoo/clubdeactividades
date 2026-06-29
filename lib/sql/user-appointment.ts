import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

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

export async function cancelUserAppointment(userAppointmentId: number) {
  const ua = await prisma.userAppointment.findUnique({
    where: { id: userAppointmentId },
    include: {
      appointment: true,  
      client: true,
    },
  });

  if (!ua) {
    throw new Error("UserAppointment not found");
  }

  const now = new Date();
  const appointmentDate = new Date(ua.appointment.initialDate);

  const hoursDiff =
    (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  // 🔴 1. validar cancelación
  const isAbonado = ua.type === "ABONADO";

  let creditCreated = false;

  // 🟢 CASO ABONADO + 48HS → CREA CRÉDITO
  if (isAbonado && hoursDiff >= 48) {
    await prisma.credit.create({
      data: {
        clientId: ua.clientId,
        activityId: ua.appointment.activityId,
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        isValid: true,
      },
    });

    creditCreated = true;
  }

  // 🟡 CASO NO ABONADO + 24HS → solo devolución manual (flag)
  const refundPending =
    !isAbonado && hoursDiff >= 24;

  // 🔍 Determinar si el cancelado estaba ocupando cupo (no lista de espera)
  const activeBefore = await prisma.userAppointment.findMany({
    where: {
      appointmentId: ua.appointmentId,
      state: { not: "CANCELLED" },
    },
    orderBy: [{ reservationDate: "asc" }, { id: "asc" }],
    select: { id: true, type: true, reservationDate: true },
  });

  const capacity = ua.appointment.slotsAvailable;
  const cancelledIndex = activeBefore.findIndex((u) => u.id === userAppointmentId);
  const wasInSlot = cancelledIndex >= 0 && cancelledIndex < capacity;

  // ❌ marcar cancelación
  await prisma.userAppointment.update({
    where: { id: userAppointmentId },
    data: {
      cancellationDate: now,
      state: "CANCELLED",
    },
  });

  // ⬆️ Promover al primero de la lista de espera si el cancelado liberó un cupo.
  // ABONADO cancelado → prioridad a ABONADO en espera; si no hay, al primero de la espera general.
  // NO_ABONADO cancelado → al primero de la espera general.
  let promotedUserAppointmentId: number | null = null;

  if (wasInSlot) {
    const waitingList = activeBefore.slice(capacity);

    const promoted = isAbonado
      ? waitingList.find((w) => w.type === "ABONADO") ?? waitingList[0]
      : waitingList[0];

    if (promoted) {
      await prisma.userAppointment.update({
        where: { id: promoted.id },
        data: { reservationDate: ua.reservationDate },
      });
      promotedUserAppointmentId = promoted.id;
    }
  }

  // 🔄 liberar cupo sólo si el cancelado lo ocupaba y no se promovió a nadie
  if (wasInSlot && promotedUserAppointmentId === null) {
    await prisma.appointment.update({
      where: { id: ua.appointmentId },
      data: {
        currentSlots: {
          decrement: 1,
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
}