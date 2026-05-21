import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllEmployees() {
  return prisma.employee.findMany({
    include: { user: true, payments: true },
  });
}

export async function getEmployeeById(id: number) {
  return prisma.employee.findUnique({
    where: { id },
    include: { user: true, payments: true },
  });
}

export async function createEmployee(data: Prisma.employeeCreateInput) {
  return prisma.employee.create({ data });
}

export async function updateEmployee(id: number, data: Prisma.employeeUpdateInput) {
  return prisma.employee.update({ where: { id }, data });
}

export async function deleteEmployee(id: number) {
  return prisma.employee.delete({ where: { id } });
}

export async function getEmployeeByUserId(userId: number) {
  return prisma.employee.findUnique({
    where: { userId },
    include: { user: true, payments: true },
  });
}

export async function getEmployeeByUserDni(dni: string) {
  return prisma.employee.findFirst({
    where: {
      user: {
        dni: dni,
        roleId: 3
      }
    },
    include: { 
      user: true 
    },
  });
}