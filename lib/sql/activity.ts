import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllActivities() {
  return prisma.activity.findMany({
    include: { professors: true, appointments: true },
  });
}

export async function getActivityById(id: number) {
  return prisma.activity.findUnique({
    where: { id },
    include: { professors: true, appointments: true },
  });
}

export async function createActivity(data: Prisma.ActivityCreateInput) {
  return prisma.activity.create({ data });
}

export async function updateActivity(id: number, data: Prisma.ActivityUpdateInput) {
  return prisma.activity.update({ where: { id }, data });
}

export async function deleteActivity(id: number) {
  return prisma.activity.delete({ where: { id } });
}
