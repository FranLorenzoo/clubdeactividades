import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllProfessors() {
  return prisma.professor.findMany({
    include: { user: true, activity: true, appointments: true },
  });
}

export async function getProfessorById(id: number) {
  return prisma.professor.findUnique({
    where: { id },
    include: { user: true, activity: true, appointments: true },
  });
}

export async function createProfessor(data: Prisma.professorCreateInput) {
  return prisma.professor.create({ data });
}

export async function updateProfessor(id: number, data: Prisma.professorUpdateInput) {
  return prisma.professor.update({ where: { id }, data });
}

export async function deleteProfessor(id: number) {
  return prisma.professor.delete({ where: { id } });
}

export async function getProfessorByUserId(userId: number) {
  return prisma.professor.findUnique({
    where: { userId },
    include: { user: true, activity: true, appointments: true },
  });
}

export async function getProfessorsByActivityId(activityId: number) {
  return prisma.professor.findMany({
    where: { activityId },
    include: { user: true, activity: true, appointments: true },
  });
}

export async function getProfessorsNamesByActivityId(activityId: number) {
  return prisma.professor.findMany({
    where: {
      activityId: activityId
    },

    select: {
      id: true,

      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
}

export async function getProfessorByUserDni(dni: string) {
  return prisma.professor.findFirst({
    where: {
      user: {
        dni: dni,
        roleId: 4
      }
    },
    include: { 
      user: true,
      activity: true
    },
  });
}