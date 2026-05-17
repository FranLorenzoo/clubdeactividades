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
    include: { appointment: true, client: true, payments: true, qr: true },
  });
}

export async function getUserAppointmentsByAppointmentId(appointmentId: number) {
  return prisma.userAppointment.findMany({
    where: { appointmentId },
    include: { appointment: true, client: true, payments: true, qr: true },
  });
}
