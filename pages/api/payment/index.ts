import { getAllPayments } from "@/lib/sql/payment";
import { parseFields } from "@/lib/validators/api";
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import QRCode from "qrcode";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return getAllPaymentsHandler(res);
  } else if (req.method === "POST") {
    return createPaymentHandler(req.body, res);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

async function getAllPaymentsHandler(res: NextApiResponse) {
  try {
    const payments = await getAllPayments();
    return res.status(200).json(payments);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function createPaymentHandler(body: Record<string, unknown>, res: NextApiResponse) {
  const { ok, values, error } = parseFields({
    paymentDate: "date",
    amount: "number",
    paymentMethod: "string",
  }, body);

  if (!ok) return res.status(400).json({ message: "Bad request " + error });

  const { userAppointmentId, employeeId } = body;
  if (!userAppointmentId) {
    return res.status(400).json({ message: "Missing required field: userAppointmentId" });
  }

  const uaId = Number(userAppointmentId);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the payment record
      const payment = await tx.payment.create({
        data: {
          paymentDate: values.paymentDate as Date,
          amount: values.amount as number,
          paymentMethod: values.paymentMethod as string,
          userAppointment: { connect: { id: uaId } },
          ...(employeeId ? { employee: { connect: { id: Number(employeeId) } } } : {}),
        },
      });

      // 2. Compute total paid for this userAppointment (including the new payment)
      const { _sum } = await tx.payment.aggregate({
        where: { userAppointmentId: uaId },
        _sum: { amount: true },
      });
      const totalPaid = _sum.amount ?? 0;

      // 3. Fetch appointment price
      const ua = await tx.userAppointment.findUnique({
        where: { id: uaId },
        include: { appointment: true },
      });
      if (!ua) throw new Error("userAppointment not found");

      const price = ua.appointment.price;
      const newState =
        totalPaid >= price ? "PAGO_COMPLETO" : totalPaid > 0 ? "PAGO_PARCIAL" : "IMPAGO";

      // 4. Update userAppointment state
      await tx.userAppointment.update({
        where: { id: uaId },
        data: { state: newState as "PAGO_COMPLETO" | "PAGO_PARCIAL" | "IMPAGO" },
      });

      // 5. If fully paid, generate QR and upsert record
      if (newState === "PAGO_COMPLETO") {
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
      }

      return { payment, state: newState };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
