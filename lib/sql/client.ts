import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllClients() {
  return prisma.client.findMany({
    include: { user: true, creditCard: true, userAppointments: true },
  });
}

export async function getClientById(id: number) {
  return prisma.client.findUnique({
    where: { id },
    include: { user: true, creditCard: true, userAppointments: true },
  });
}

export async function createClient(data: Prisma.clientCreateInput) {
  return prisma.client.create({ data });
}

export async function updateClient(id: number, data: Prisma.clientUpdateInput) {
  return prisma.client.update({ where: { id }, data });
}

export async function deleteClient(id: number) {
  return prisma.client.delete({ where: { id } });
}

export async function getClientByUserId(userId: number) {
  return prisma.client.findUnique({
    where: { userId },
    include: { user: true, creditCard: true, userAppointments: true },
  });
}
