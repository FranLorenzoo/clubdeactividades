import { NextApiRequest, NextApiResponse } from "next";

import { getAppointmentById, updateAppointment } from "@/lib/sql/appointment";
import { getCreditById, updateCredit } from "@/lib/sql/credit";
import { createUserAppointment } from "@/lib/sql/user-appointment";

import {
  userAppointmentState,
  userAppointmentType,
} from "@/lib/generated/prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    const { appointmentId, creditId } = req.body;

    // Buscar crédito
    const credit = await getCreditById(Number(creditId));

    if (!credit) {
      return res.status(404).json({
        message: "Crédito inexistente",
      });
    }

    if (!credit.isValid) {
      return res.status(400).json({
        message: "El crédito ya fue utilizado",
      });
    }

    if (new Date(credit.endDate) < new Date()) {
      return res.status(400).json({
        message: "El crédito está vencido",
      });
    }

    // Buscar turno
    const appointment = await getAppointmentById(Number(appointmentId));

    if (!appointment) {
      return res.status(404).json({
        message: "Turno inexistente",
      });
    }

    // Verificar cupo
    if (appointment.currentSlots >= appointment.slotsAvailable) {
      return res.status(400).json({
        message: "No hay cupos disponibles",
      });
    }

    // Crear reserva
    await createUserAppointment({
      appointment: {
        connect: {
          id: appointment.id,
        },
      },
      client: {
        connect: {
          id: credit.clientId,
        },
      },
      reservationDate: new Date(),
      attended: false,
      rejected: false,
      state: userAppointmentState.PAGO_COMPLETO,
      type: userAppointmentType.NO_ABONADO,
    });

    // Incrementar ocupación del turno
    await updateAppointment(appointment.id, {
      currentSlots: {
        increment: 1,
      },
    });

    // Invalidar crédito
    await updateCredit(credit.id, {
      isValid: false,
    });

    return res.status(200).json({
      message: "Reserva realizada correctamente",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}