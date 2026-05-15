import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllRoles() {
  return prisma.role.findMany({
    include: { users: true },
  });
}

export async function getRoleById(id: number) {
  return prisma.role.findUnique({
    where: { id },
    include: { users: true },
  });
}

export async function createRole(data: Prisma.roleCreateInput) {
  return prisma.role.create({ data });
}

export async function updateRole(id: number, data: Prisma.roleUpdateInput) {
  return prisma.role.update({ where: { id }, data });
}

export async function deleteRole(id: number) {
  return prisma.role.delete({ where: { id } });
}
