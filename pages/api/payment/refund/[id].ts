import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }
  const { id } = req.query;
  const paymentId = parseInt(id as string);

  if (isNaN(paymentId)) {
    return res.status(400).json({ message: "ID de reembolso inválido" });
  }

  try {
    const originalNegativePayment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!originalNegativePayment) {
      return res.status(404).json({ message: "El registro de reembolso no existe." });
    }

    if (originalNegativePayment.amount >= 0) {
      return res.status(400).json({ message: "Este pago no es una devolución pendiente." });
    }

    await prisma.$transaction(async (tx) => {
      
      await tx.payment.create({
        data: {
          userAppointmentId: originalNegativePayment.userAppointmentId,
          paymentDate: new Date(),
          amount: Math.abs(originalNegativePayment.amount),
          paymentMethod: "CASH",
          employeeId: null, 
        },
      });
    });

    return res.status(200).json({ message: "Devolución en efectivo registrada con éxito." });

  } catch (error: any) {
    console.error("Error al procesar devolución:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
}