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
      const rawPrice = ua.appointment.price ?? 0;

      const recordedPaid = ua.payments.reduce(
        (sum, p) => sum + Math.max(p.amount, 0),
        0
      );

      const isUniquePartialWithoutPayments =
        ua.type === "NO_ABONADO" &&
        ua.state === "PAGO_PARCIAL" &&
        recordedPaid === 0;

      const price = isUniquePartialWithoutPayments ? rawPrice / 2 : rawPrice;

      const impliedPaid =
        recordedPaid === 0 && ua.type === "NO_ABONADO"
          ? ua.state === "PAGO_COMPLETO"
            ? price
            : ua.state === "PAGO_PARCIAL"
            ? price * 0.5
            : 0
          : 0;

      const totalPaid = recordedPaid + impliedPaid;
      const isCancelled = ua.state === "CANCELLED" || ua.cancellationDate !== null || ua.rejected;
      const remainingDebt = isCancelled ? 0 : Math.max(price - totalPaid, 0);

      return {
        ...ua,
        price,
        totalPaid,
        remainingDebt,
        state: isCancelled ? "CANCELLED" : ua.state,
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