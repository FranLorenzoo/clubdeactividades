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

export async function createUser(data: Prisma.UserCreateInput) {
  return prisma.user.create({ data });
}

export async function updateUser(id: number, data: Prisma.UserUpdateInput) {
  return prisma.user.update({ where: { id }, data });
}

export async function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}

export async function getUserByDNI(dni: string) {
  return prisma.user.findFirst({
    where: { dni },
    select: {
      id: true,
      dni: true,
      email: true,
      client: {
        select: {
          active: true,
          suspended: true,
          userAppointments: true,
        },
      },
    }
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      dni: true,
      email: true,
      client: {
        select: {
          active: true,
          suspended: true,
          userAppointments: true,
        },
      },
    }
  });
}
