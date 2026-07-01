import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllAppointments() {
  return prisma.appointment.findMany({
    where: {
      isDeleted: false,
    },
    include: { activity: true, 
      professor: {
        include: {
          user: true, 
        }, 
      },userAppointments: true},
    orderBy: {
      initialDate: "asc"
    }
  });
}

export async function getAllDeleteAppointments() {
  return prisma.appointment.findMany({
    where: {
      isDeleted: true,
    },
    include: { activity: true, 
      professor: {
        include: {
          user: true, 
        }, 
      },userAppointments: true},
    orderBy: {
      initialDate: "asc"
    }
  });
}

export async function getAppointmentById(id: number) {
  return prisma.appointment.findUnique({
    where: { id },
    include: { activity: true, professor: true, userAppointments: true },
  });
}

export async function createAppointment(data: Prisma.appointmentCreateInput) {
  return prisma.appointment.create({ data });
}

export async function updateAppointment(id: number, data: Prisma.appointmentUpdateInput) {
  return prisma.appointment.update({ where: { id }, data });
}

export async function deleteAppointment(id: number) {
  return prisma.appointment.delete({ where: { id:Number(id) } });
}

export async function softDeleteAppointment(id: number) {
  return prisma.appointment.update({
    where: { id: Number(id) },
    data: { isDeleted: true },
  });
}

export async function reactivateAppointment(id: number) {
  return prisma.appointment.update({
    where: { id: Number(id) },
    data: { isDeleted: false },
  });
}

export async function getAppointmentsByActivityId(
  activityId: number,
  from?: Date,
  to?: Date
) {
  return prisma.appointment.findMany({
    where: {
      activityId,
      ...(from || to
        ? { initialDate: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
        : {}),
    },
    include: { activity: true, professor: { include: { user: true } }, userAppointments: true },
  });
}

export async function getAppointmentsByProfessorId(professorId: number) {
  return prisma.appointment.findMany({
    where: { professorId },
    include: { activity: true, professor: true, userAppointments: true },
  });
}

export async function getAppointmentByStartDateAndActivity(initialDate: Date, activityId: number) {
  return prisma.appointment.findFirst({
    where: {
      initialDate,
      activityId,
    },
  });
}

export async function updateFutureAppointments(
  startDate: Date,
  activityId: number,
  dayOfWeek: number,
  hour: number,
  data: { price: number; professorId: number; slotsAvailable: number }
) {
  const newMax = data.slotsAvailable;

  const appointments = await prisma.appointment.findMany({
  where: {
    activityId: Number(activityId),
    initialDate: { gte: startDate }
  },
  include: {
    _count: {
      select: {
        userAppointments: {
          where: { rejected: false }
        }
      }
    }
  }
});

const filteredAppointments = appointments.filter((app) => {
  const dateInArg = new Date(app.initialDate.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  const matchesDay = dateInArg.getDay() === Number(dayOfWeek);
  const matchesHour = dateInArg.getHours() === Number(hour);
  return matchesDay && matchesHour;
});

await prisma.$transaction(
  filteredAppointments.map((app) => {
    const totalReservas = app._count.userAppointments;
    const finalSlotsAvailable = Number(newMax) >= totalReservas ? Number(newMax) : totalReservas;
    const finalCurrentSlots = Number(newMax) >= totalReservas ? Number(newMax) - totalReservas : 0;
    
    // Si ya hay reservas, el precio no se toca y se conserva el actual
    const finalPrice = totalReservas > 0 ? app.price : Number(data.price);

    return prisma.appointment.update({
      where: { id: app.id },
      data: {
        price: finalPrice,
        professorId: Number(data.professorId),
        slotsAvailable: finalSlotsAvailable,
        currentSlots: finalCurrentSlots
      }
    });
  })
);
}

export async function suspendAppointment(id: number) {
  return prisma.$transaction(async (tx) => {
    
    // 1. Obtenemos el turno con todas las inscripciones y sus respectivos pagos
    const appointment = await tx.appointment.findUnique({
      where: { id },
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

      // 🟢 DEVOLUCIÓN OBLIGATORIA (Sin importar las horas previas a la clase)
      const mainPayment = userApp.payments[0];

      if (userApp.type === "ABONADO") {
        // 2. Ahora impactamos la caja/facturación del ABONADO según cómo pagó su inscripción
        if (mainPayment) {
          if (mainPayment.paymentMethod === "online") {
            console.log(`[ABONADO - FACTURA AUTOMÁTICA] Reembolso online procesado por $${mainPayment.amount} al cliente ID ${userApp.clientId}`);

          } else if (mainPayment.paymentMethod === "CASH") {
            await tx.payment.create({
              data: {
                userAppointmentId: userApp.id,
                paymentDate: now,
                amount: -mainPayment.amount,
                paymentMethod: "CASH",
                employeeId: null,
              }
            });
            console.log(`[ABONADO - FACTURA PENDIENTE - CASH] Reembolso de $${mainPayment.amount} registrado para aprobación manual.`);
          }
        }

      } else {
        // 3. Caso NO_ABONADO: Evaluamos según sus 3 métodos de pago posibles
        if (mainPayment) {
          const method = mainPayment.paymentMethod;

          if (method === "credit") {
            // Reactivamos el último crédito usado de este cliente para esta actividad
            const lastUsedCredit = await tx.credit.findFirst({
              where: {
                clientId: userApp.clientId,
                activityId: appointment.activityId,
                isValid: false
              },
              orderBy: { id: 'desc' }
            });

            if (lastUsedCredit) {
              await tx.credit.update({
                where: { id: lastUsedCredit.id },
                data: { isValid: true }
              });
            } else {
              // Fallback si no se encuentra el registro exacto
              await tx.credit.create({
                data: {
                  clientId: userApp.clientId,
                  activityId: appointment.activityId,
                  endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                  isValid: true,
                },
              });
            }

          } else if (method === "online") {
            console.log(`[NO ABONADO - FACTURA AUTOMÁTICA] Reembolso online procesado por $${mainPayment.amount} al cliente ID ${userApp.clientId}`);
          } else if (method === "CASH") {
            await tx.payment.create({
              data: {
                userAppointmentId: userApp.id,
                paymentDate: now,
                amount: -mainPayment.amount,
                paymentMethod: "CASH",
                employeeId: null, // Requiere que el recepcionista le dé el efectivo en mano
              }
            });
            console.log(`[NO ABONADO - FACTURA PENDIENTE - CASH] Reembolso de $${mainPayment.amount} registrado para aprobación manual.`);
          }
        }
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

    // 3. Finalmente vaciamos los cupos de la clase dejándolos en 0
    return tx.appointment.update({
      where: { id },
      data: {
        slotsAvailable: 0,
        currentSlots: 0,
      },
    });
  });
}