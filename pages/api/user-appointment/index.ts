import { getAllUserAppointments, createUserAppointment } from "@/lib/sql/user-appointment";
import { Prisma, userAppointmentState } from "@/lib/generated/prisma/client";
import { parseFields } from "@/lib/validators/api";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return getAllUserAppointmentsHandler(res);
  } else if (req.method === "POST") {
    return createUserAppointmentHandler(req.body, res);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

async function getAllUserAppointmentsHandler(res: NextApiResponse) {
  try {
    const userAppointments = await getAllUserAppointments();
    return res.status(200).json(userAppointments);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function createUserAppointmentHandler(body: Record<string, unknown>, res: NextApiResponse) {
  const { ok, values, error } = parseFields({
    reservationDate: "date",
  }, body);

  if (!ok) return res.status(400).json({ message: "Bad request " + error });

  const { appointmentId, clientId, rejected, state } = body;

  if (!appointmentId || !clientId || rejected === undefined || !state) {
    return res.status(400).json({ message: "Missing required fields: appointmentId, clientId, rejected, state" });
  }

  const validStates = ["PAGO_COMPLETO", "PAGO_PARCIAL", "IMPAGO"];
  if (!validStates.includes(String(state))) {
    return res.status(400).json({ message: "Invalid state. Must be PAGO_COMPLETO, PAGO_PARCIAL or IMPAGO" });
  }

  const createInput: Prisma.userAppointmentCreateInput = {
    reservationDate: values.reservationDate as Date,
    rejected: Boolean(rejected),
    state: state as userAppointmentState,
    appointment: { connect: { id: Number(appointmentId) } },
    client: { connect: { id: Number(clientId) } },
  };

  try {
    const userAppointment = await createUserAppointment(createInput);
    res.status(201).json(userAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
