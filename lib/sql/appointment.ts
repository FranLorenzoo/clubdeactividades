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

  const hourString = String(hour).padStart(2, '0');

  return prisma.$executeRaw`
    UPDATE "appointment"
    SET 
      "price" = ${data.price},
      "professorId" = ${Number(data.professorId)},
      "slotsAvailable" = CASE 
        WHEN ${newMax} >= ("slotsAvailable" - "currentSlots") THEN ${newMax}
        ELSE ("slotsAvailable" - "currentSlots")
      END,
      "currentSlots" = CASE 
        WHEN ${newMax} >= ("slotsAvailable" - "currentSlots") THEN ${newMax} - ("slotsAvailable" - "currentSlots")
        ELSE 0
      END
    WHERE 
      "activityId" = ${Number(activityId)} 
      AND "initialDate" >= ${startDate}
      -- 🚀 CAMBIAMOS EXTRACT POR FORMATEO DE TEXTO EN POSTGRES (SÚPER ESTABLE):
      AND EXTRACT(DOW FROM "initialDate" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires')::integer = ${Number(dayOfWeek)}
      AND TO_CHAR("initialDate" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires', 'HH24') = ${hourString}
  `;
}