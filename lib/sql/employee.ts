import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllEmployees() {
  return prisma.employee.findMany({
    where: { 
      user: {
        isDeleted: false
      }
    },
    include: { user: true, payments: true },
  });
}

export async function getEmployeeById(id: number) {
  return prisma.employee.findFirst({
    where: { id,
      user: {
        isDeleted: false
      }
    },
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
  const employee = await prisma.employee.findUnique({
    where: {
      id: id
    }
  });

  if (!employee) {
    throw new Error("employee not found");
  }

  return prisma.user.update({
    where: {
      id: employee.userId
    },
    data: {
      isDeleted: true
    }
  });
}

export async function getEmployeeByUserId(userId: number) {
  return prisma.employee.findFirst({
    where: { 
      userId,
      user: {
        isDeleted: false
      }
    },
    include: { user: true, payments: true },
  });
}

export async function getEmployeeByUserDni(dni: string) {
  return prisma.employee.findFirst({
    where: {
      user: {
        dni: dni,
        roleId: 3,
        isDeleted: false
      }
    },
    include: { 
      user: true 
    },
  });
}