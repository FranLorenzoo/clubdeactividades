import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllUserAppointments() {
  return prisma.userAppointment.findMany({
    include: { user: true, appointment: true, qr: true },
  });
}

export async function getUserAppointmentById(id: number) {
  return prisma.userAppointment.findUnique({
    where: { id },
    include: { user: true, appointment: true, qr: true },
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
