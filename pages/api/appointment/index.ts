import { createAppointment, getAllAppointments } from "@/lib/sql/appointment";
import { parseFields } from "@/lib/validators/api";
import { Prisma } from "@/lib/generated/prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 

  switch(req.method) {
    case "GET":
      return getAllAppointmentsHandler(res);
    case "POST":
      return createAppointmentsHandler(req.body, res);
    default:
      res.status(405).json({ message: "Method not allowed" });
  }

}

async function getAllAppointmentsHandler(res: NextApiResponse) {
  try {
    const appointments = await getAllAppointments();
    return res.status(200).json(appointments);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function createAppointmentsHandler(body: Record<string, unknown>[], res: NextApiResponse) {

  if (!Array.isArray(body)) return res.status(400).json({ message: "Expected an array of appointments" });

  try {
    const appointmentsToCreate: Prisma.appointmentCreateInput[] = [];

    for (const item of body) {
      const { ok, values, error } = parseFields(
        {
          initialDate: "date",
          endDate: "date",
          price: "number",
        },
        item
      );

      if (!ok) return res.status(400).json({ message: "Bad request: " + error });

      const {
        professorId,
        activityId,
        currentSlots,
        slotsAvailable
      } = item;

      if (!professorId || !activityId) return res.status(400).json({ message: "Missing required fields: professorId, activityId" });

      appointmentsToCreate.push({
        initialDate: values.initialDate as Date,
        endDate: values.endDate as Date,
        price: values.price as number,
        currentSlots: Number(currentSlots),
        slotsAvailable: Number(slotsAvailable),

        activity: {
          connect: {
            id: Number(activityId)
          }
        },

        professor: {
          connect: {
            id: Number(professorId)
          }
        }
      });
    }

    const createdAppointments = await Promise.all(
      appointmentsToCreate.map((appointment) =>
        createAppointment(appointment)
      )
    );

    return res.status(201).json(createdAppointments);

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error " + error
    });
  }
}
