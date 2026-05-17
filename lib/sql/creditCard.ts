import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllCreditCards() {
  return prisma.creditCard.findMany({
    include: { client: true },
  });
}

export async function getCreditCardById(id: number) {
  return prisma.creditCard.findUnique({
    where: { id },
    include: { client: true },
  });
}

export async function createCreditCard(data: Prisma.creditCardCreateInput) {
  return prisma.creditCard.create({ data });
}

export async function updateCreditCard(id: number, data: Prisma.creditCardUpdateInput) {
  return prisma.creditCard.update({ where: { id }, data });
}

export async function deleteCreditCard(id: number) {
  return prisma.creditCard.delete({ where: { id } });
}

export async function getCreditCardByClientId(clientId: number) {
  return prisma.creditCard.findUnique({
    where: { clientId },
    include: { client: true },
  });
}
