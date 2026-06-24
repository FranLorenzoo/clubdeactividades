import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllCredits() {
  return prisma.credit.findMany({
    include: { client: true, activity: true },
  });
}

export async function getCreditById(id: number) {
  return prisma.credit.findUnique({
    where: { id },
    include: { client: true, activity: true },
  });
}

export async function getCreditsByClientId(clientId: number) {
  return prisma.credit.findMany({
    where: {
      clientId,
      isValid: true,
      endDate: {
        gte: new Date(), // 👈 solo créditos no vencidos
      },
    },
    include: { activity: true },

    // 👇 ordenamos por vencimiento (los que vencen primero arriba)
    orderBy: {
      endDate: "asc",
    },
  });
}

export async function getCreditsByActivityId(activityId: number) {
  return prisma.credit.findMany({
    where: { activityId },
    include: { client: true },
  });
}

export async function createCredit(data: Prisma.creditCreateInput) {
  return prisma.credit.create({ data });
}

export async function updateCredit(id: number, data: Prisma.creditUpdateInput) {
  return prisma.credit.update({ where: { id }, data });
}

export async function deleteCredit(id: number) {
  return prisma.credit.delete({ where: { id } });
}

export async function getValidCreditForClientAndActivity(
  clientId: number,
  activityId: number
) {
  return prisma.credit.findFirst({
    where: {
      clientId,
      activityId,
      isValid: true,
      endDate: { gte: new Date() },
    },
  });
}
