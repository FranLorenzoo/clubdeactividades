import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllQRs() {
  return prisma.qR.findMany({
    include: { userAppointment: true },
  });
}

export async function getQRById(id: number) {
  return prisma.qR.findUnique({
    where: { id },
    include: { userAppointment: true },
  });
}

export async function createQR(data: Prisma.QRCreateInput) {
  return prisma.qR.create({ data });
}

export async function updateQR(id: number, data: Prisma.QRUpdateInput) {
  return prisma.qR.update({ where: { id }, data });
}

export async function deleteQR(id: number) {
  return prisma.qR.delete({ where: { id } });
}
