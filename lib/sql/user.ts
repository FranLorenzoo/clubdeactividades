import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllUsers() {
  return prisma.user.findMany({
    where: { isDeleted: false },
    include: { role: true, client: true, employee: true, professor: true },
  });
}

export async function getUserById(id: number) {
  return prisma.user.findFirst({
    where: { id, isDeleted: false },
    include: { role: true, client: true, employee: true, professor: true },
  });
}

export async function getUserByDNI(dni: string) {
  return prisma.user.findFirst({
    where: { dni, isDeleted: false },
    include: { role: true, client: true, employee: true, professor: true },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email, isDeleted: false },
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
  return prisma.user.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });
} 