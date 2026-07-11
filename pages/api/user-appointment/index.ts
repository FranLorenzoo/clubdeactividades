import { getAllUserAppointments, createUserAppointment, getOverdueImpagoCountByClientId } from "@/lib/sql/user-appointment";
import { Prisma } from "@/lib/generated/prisma/client";
import { parseFields } from "@/lib/validators/api";
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import QRCode from "qrcode";

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
    employeeBooking,
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

  const overdueCount = await getOverdueImpagoCountByClientId(
    Number(clientId)
  );

  if (overdueCount >= 3) {
    return res.status(403).json({
      message:
        "Tu cuenta está suspendida por 3 o más turnos impagos vencidos. Regularizá tu situation en Mis pagos.",
      suspended: true,
    });
  }

  const isEmployeeBooking = employeeBooking === true;

  const finalState = isEmployeeBooking
    ? "PAGO_COMPLETO"
    : (state as any);

  try {
    const cleanAppointmentId = Number(appointmentId);
    const cleanClientId = Number(clientId);

    const existingAppointment = await prisma.userAppointment.findFirst({
      where: {
        appointmentId: cleanAppointmentId,
        clientId: cleanClientId,
      },
    });

    let userAppointment;

    if (existingAppointment) {
      userAppointment = await prisma.userAppointment.update({
        where: { id: existingAppointment.id },
        data: {
          reservationDate: values.reservationDate as Date,
          cancellationDate: null, 
          rejected: false,
          state: finalState,
          type: type as any, 
        },
      });
    } else {
      const createInput: Prisma.userAppointmentCreateInput = {
        reservationDate: values.reservationDate as Date,
        rejected: Boolean(rejected),
        state: finalState,
        type: type as any,
        appointment: { connect: { id: cleanAppointmentId } },
        client: { connect: { id: cleanClientId } },
      };

      try {
        userAppointment = await createUserAppointment(createInput);
      } catch (createError) {
        const fallbackAppointment = await prisma.userAppointment.findFirst({
          where: {
            appointmentId: cleanAppointmentId,
            clientId: cleanClientId,
          },
        });

        if (!fallbackAppointment) throw createError;

        userAppointment = await prisma.userAppointment.update({
          where: { id: fallbackAppointment.id },
          data: {
            reservationDate: values.reservationDate as Date,
            cancellationDate: null, 
            rejected: false,
            state: finalState,
            type: type as any,
          },
        });
      }
    }

    if (userAppointment.type === "ABONADO" && userAppointment.state !== "PAGO_COMPLETO") {
      try {
        const qrImage = await QRCode.toDataURL(String(userAppointment.id));
        await prisma.qR.upsert({
          where: { userAppointmentId: userAppointment.id },
          update: { qrImage },
          create: {
            userAppointmentId: userAppointment.id,
            qrImage,
            url: String(userAppointment.id),
            accepted: false,
          },
        });
      } catch (qrError) {
        console.error(qrError);
      }
    }

    return res.status(200).json(userAppointment);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}