import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/professor";

export async function getAllProfessors() {
  return prisma.professor.findMany({
    where: {
      user: {
        isDeleted: false
      }
    },
    include: { user: true, activity: true, appointments: true },
  });
}

export async function getProfessorById(id: number) {
  return prisma.professor.findFirst({
    where: { 
      id,
      user: {
        isDeleted: false
      }
    },
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
  const professor = await prisma.professor.findUnique({
    where: {
      id: id
    }
  });

  if (!professor) {
    throw new Error("professor not found");
  }

  return prisma.user.update({
    where: {
      id: professor.userId
    },
    data: {
      isDeleted: true
    }
  });
}

export async function getProfessorByUserId(userId: number) {
  return prisma.professor.findFirst({
    where: { 
      userId,
      user: {
        isDeleted: false
      }
    },
    include: { user: true, activity: true, appointments: true },
  });
}

export async function getProfessorsByActivityId(activityId: number) {
  return prisma.professor.findMany({
    where: { 
      activityId,
      user: {
        isDeleted: false
      }
    },
    include: { user: true, activity: true, appointments: true },
  });
}

export async function getProfessorsNamesByActivityId(activityId: number) {
  return prisma.professor.findMany({
    where: {
      activityId: activityId,
      user: {
        isDeleted: false
      }
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
        roleId: 4,
        isDeleted: false
      }
    },
    include: { 
      user: true,
      activity: true
    },
  });
}