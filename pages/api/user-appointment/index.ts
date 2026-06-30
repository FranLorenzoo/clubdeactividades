import { getAllUserAppointments, createUserAppointment, getOverdueImpagoCountByClientId } from "@/lib/sql/user-appointment";
import { Prisma, userAppointmentState, userAppointmentType } from "@/lib/generated/prisma/client";
import { parseFields } from "@/lib/validators/api";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return getAllUserAppointmentsHandler(res);
  }

  if (req.method === "POST") {
    return createUserAppointmentHandler(req.body, res);
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function getAllUserAppointmentsHandler(res: NextApiResponse) {
  try {
    const userAppointments = await getAllUserAppointments();
    return res.status(200).json(userAppointments);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function createUserAppointmentHandler(
  body: Record<string, unknown>,
  res: NextApiResponse
) {
  const { ok, values, error } = parseFields(
    {
      reservationDate: "date",
    },
    body
  );

  if (!ok) {
    return res.status(400).json({ message: "Bad request " + error });
  }

  const {
    appointmentId,
    clientId,
    rejected,
    state,
    type,
    employeeBooking, // 👈 NUEVO
  } = body;

  if (!appointmentId || !clientId || rejected === undefined || !state) {
    return res.status(400).json({
      message:
        "Missing required fields: appointmentId, clientId, rejected, state",
    });
  }

  const validStates = ["PAGO_COMPLETO", "PAGO_PARCIAL", "IMPAGO"];
  if (!validStates.includes(String(state))) {
    return res.status(400).json({
      message:
        "Invalid state. Must be PAGO_COMPLETO, PAGO_PARCIAL or IMPAGO",
    });
  }

  const validTypes = ["ABONADO", "NO_ABONADO"];
  if (!type || !validTypes.includes(String(type))) {
    return res.status(400).json({
      message: "Invalid or missing type. Must be ABONADO or NO_ABONADO",
    });
  }

  // ❗ control de impagos (lo dejamos igual)
  const overdueCount = await getOverdueImpagoCountByClientId(
    Number(clientId)
  );

  if (overdueCount >= 3) {
    return res.status(403).json({
      message:
        "Tu cuenta está suspendida por 3 o más turnos impagos vencidos. Regularizá tu situación en Mis pagos.",
      suspended: true,
    });
  }

  // 🔥 REGLA NUEVA: EMPLEADO = PAGO AUTOMÁTICO
  const isEmployeeBooking = employeeBooking === true;

  const finalState: userAppointmentState = isEmployeeBooking
    ? "PAGO_COMPLETO"
    : (state as userAppointmentState);

  const createInput: Prisma.userAppointmentCreateInput = {
    reservationDate: values.reservationDate as Date,
    rejected: Boolean(rejected),

    state: finalState,

    type: type as userAppointmentType,

    appointment: { connect: { id: Number(appointmentId) } },
    client: { connect: { id: Number(clientId) } },

    // 💰 si es empleado, se marca como pago total automático
    ...(isEmployeeBooking && {
      totalPaid: body.price ?? 0,
      remainingDebt: 0,
    }),
  };

  try {
    const userAppointment = await createUserAppointment(createInput);
    return res.status(201).json(userAppointment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}