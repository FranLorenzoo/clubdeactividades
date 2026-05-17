import { getAllPayments, createPayment } from "@/lib/sql/payment";
import { Prisma } from "@/lib/generated/prisma/client";
import { parseFields } from "@/lib/validators/api";
import { NextApiRequest, NextApiResponse } from "next";

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
  if (!userAppointmentId || !employeeId) {
    return res.status(400).json({ message: "Missing required fields: userAppointmentId, employeeId" });
  }

  const createInput: Prisma.paymentCreateInput = {
    paymentDate: values.paymentDate as Date,
    amount: values.amount as number,
    paymentMethod: values.paymentMethod as string,
    userAppointment: { connect: { id: Number(userAppointmentId) } },
    employee: { connect: { id: Number(employeeId) } },
  };

  try {
    const payment = await createPayment(createInput);
    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
