import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllUsers() {
  return prisma.user.findMany({
    include: { role: true, client: true, employee: true, professor: true },
  });
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    include: { role: true, client: true, employee: true, professor: true },
  });
}

export async function createUser(data: Prisma.userCreateInput) {
  return prisma.user.create({ data });
}

export async function updateUser(id: number, data: Prisma.userUpdateInput) {
  return prisma.user.update({ where: { id }, data });
}

export async function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}
