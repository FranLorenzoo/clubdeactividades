import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllAppointments() {
  return prisma.appointment.findMany({
    include: { activity: true, professor: true, userAppointments: true },
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

export async function getAppointmentsByActivityId(activityId: number) {
  return prisma.appointment.findMany({
    where: { activityId },
    include: { activity: true, professor: { include: { user: true } }, userAppointments: true },
  });
}

export async function getAppointmentsByProfessorId(professorId: number) {
  return prisma.appointment.findMany({
    where: { professorId },
    include: { activity: true, professor: true, userAppointments: true },
  });
}

