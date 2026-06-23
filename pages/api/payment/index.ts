import { getAllPayments } from "@/lib/sql/payment";
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import QRCode from "qrcode";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return getAllPaymentsHandler(res);
  }

  if (req.method === "POST") {
    return createPaymentHandler(req.body, res);
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function getAllPaymentsHandler(res: NextApiResponse) {
  try {
    const payments = await getAllPayments();
    return res.status(200).json(payments);
  } catch (error) {
    console.error("GET_PAYMENTS_ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function createPaymentHandler(
  body: Record<string, unknown>,
  res: NextApiResponse
) {
  try {
    console.log("📥 BODY RECIBIDO:", body);

    const { paymentDate, paymentMethod, userAppointmentId, employeeId } = body;

    if (!userAppointmentId || !paymentMethod) {
      return res.status(400).json({
        message: "Missing required fields: userAppointmentId or paymentMethod",
      });
    }

    const uaId = Number(userAppointmentId);

    const result = await prisma.$transaction(async (tx) => {
      const ua = await tx.userAppointment.findUnique({
        where: { id: uaId },
        include: { appointment: true },
      });

      if (!ua) throw new Error("userAppointment not found");

      const price = ua.appointment.price;

      if (typeof price !== "number") {
        throw new Error("Invalid appointment price");
      }

      const { _sum } = await tx.payment.aggregate({
        where: { userAppointmentId: uaId },
        _sum: { amount: true },
      });

      const previousTotal = _sum.amount ?? 0;

      let amount = price - previousTotal;

      if (amount < 0) amount = 0;

      console.log("💰 PRICE:", price);
      console.log("💳 PREVIOUS:", previousTotal);
      console.log("🧾 AMOUNT:", amount);

      const payment = await tx.payment.create({
        data: {
          paymentDate: paymentDate
            ? new Date(paymentDate as string)
            : new Date(),
          amount,
          paymentMethod: paymentMethod as string,

          userAppointment: {
            connect: { id: uaId },
          },

          // 👇 employee opcional (FIX DEFINITIVO)
          ...(employeeId
            ? {
                employee: {
                  connect: { id: Number(employeeId) },
                },
              }
            : {}),
        },
      });

      const totalPaid = previousTotal + amount;

      const newState =
        totalPaid >= price
          ? "PAGO_COMPLETO"
          : totalPaid > 0
          ? "PAGO_PARCIAL"
          : "IMPAGO";

      await tx.userAppointment.update({
        where: { id: uaId },
        data: { state: newState },
      });

      if (newState === "PAGO_COMPLETO") {
        try {
          const qrImage = await QRCode.toDataURL(String(uaId));

          await tx.qR.upsert({
            where: { userAppointmentId: uaId },
            update: { qrImage },
            create: {
              userAppointmentId: uaId,
              qrImage,
              url: String(uaId),
              accepted: false,
            },
          });
        } catch (err) {
          console.error("QR_ERROR:", err);
        }
      }

      return {
        payment,
        state: newState,
        price,
        totalPaid,
        remainingDebt: price - totalPaid,
      };
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("🔥 PAYMENT ERROR:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}