import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllPayments() {
  return prisma.payment.findMany({
    include: { userAppointment: true, employee: true },
  });
}

export async function getPaymentById(id: number) {
  return prisma.payment.findUnique({
    where: { id },
    include: { userAppointment: true, employee: true },
  });
}

export async function createPayment(data: Prisma.paymentCreateInput) {
  return prisma.payment.create({ data });
}

export async function updatePayment(id: number, data: Prisma.paymentUpdateInput) {
  return prisma.payment.update({ where: { id }, data });
}

export async function deletePayment(id: number) {
  return prisma.payment.delete({ where: { id } });
}

export async function getPaymentsByUserAppointmentId(userAppointmentId: number) {
  return prisma.payment.findMany({
    where: { userAppointmentId },
    include: { userAppointment: true, employee: true },
  });
}

export async function getPaymentsByEmployeeId(employeeId: number) {
  return prisma.payment.findMany({
    where: { employeeId },
    include: { userAppointment: true, employee: true },
  });
}
