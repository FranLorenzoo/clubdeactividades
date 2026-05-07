import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllEmployees() {
  return prisma.employee.findMany({
    include: { role: true, activity: true, payments: true, appointments: true },
  });
}

export async function getEmployeeById(id: number) {
  return prisma.employee.findUnique({
    where: { id },
    include: { role: true, activity: true, payments: true, appointments: true },
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
