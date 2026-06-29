import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllAppointments() {
  return prisma.appointment.findMany({
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