import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getAllClients() {
  return prisma.client.findMany({
    where: {
      user: {
        isDeleted: false,
      },
    },
    include: {
      user: true,
      creditCard: true,
      userAppointments: {
        include: {
          appointment: {
            include: {
              activity: true,
            },
          },
          payments: true,
        },
      },
    },
  });
}


export async function getClientById(id: number) {
  const client = await prisma.client.findFirst({
    where: {
      id,
      user: {
        isDeleted: false,
      },
    },

    include: {
      user: true,
      creditCard: true,

      userAppointments: {
        include: {
          appointment: {
            include: {
              activity: true,
            },
          },
          payments: true,
        },
      },
    },
  });

  if (!client) return null;

  return {
    ...client,
    userAppointments: client.userAppointments.map((ua) => {
      const price = ua.appointment.price ?? 0;

      const totalPaid = ua.payments.reduce(
        (sum, p) => sum + p.amount,
        0
      );

      const remainingDebt = price - totalPaid;

      // Preservamos el estado real si la reserva ya fue cancelada,
      // sino lo derivamos de los pagos acumulados.
      const state =
        ua.state === "CANCELLED"
          ? "CANCELLED"
          : totalPaid >= price
          ? "PAGO_COMPLETO"
          : totalPaid > 0
          ? "PAGO_PARCIAL"
          : "IMPAGO";

      return {
        ...ua,
        price,
        totalPaid,
        remainingDebt,
        state,
      };
    }),
  };
}



export async function createClient(data: Prisma.clientCreateInput) {
  return prisma.client.create({ data });
}

export async function updateClient(
  id: number,
  data: Prisma.clientUpdateInput
) {
  return prisma.client.update({ where: { id }, data });
}

export async function deleteClient(id: number) {
  const client = await prisma.client.findUnique({
    where: { id },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  return prisma.user.update({
    where: {
      id: client.userId,
    },
    data: {
      isDeleted: true,
    },
  });
}



export async function getClientByUserId(userId: number) {
  return prisma.client.findFirst({
    where: {
      userId,
      user: {
        isDeleted: false,
      },
    },
    include: {
      user: true,
      creditCard: true,
      userAppointments: {
        include: {
          appointment: {
            include: {
              activity: true,
            },
          },
          payments: true,
        },
      },
    },
  });
}

export async function getClientByUserDni(dni: string) {
  return prisma.client.findFirst({
    where: {
      user: {
        dni: dni,
        roleId: 1,
        isDeleted: false,
      },
    },
    include: {
      user: true,
    },
  });
}