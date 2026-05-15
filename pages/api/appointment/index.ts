import { CreateAppointmentDto } from "@/lib/dto/appointment";
import { createAppointment, getAllAppointments } from "@/lib/sql/appointment";
import { parseFields } from "@/lib/validators/api";
import { Prisma } from "@/lib/generated/prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 

  switch(req.method) {
    case "GET":
      return getAllAppointmentsHandler(res);
    case "POST":
      return createAppointmentHandler(req.body, res);
    default:
      res.status(405).json({ message: "Method not allowed" });
  }

}

async function getAllAppointmentsHandler(res: NextApiResponse) {
  try {
    const appointments = await getAllAppointments();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function createAppointmentHandler(body: Record<string, unknown>, res: NextApiResponse) {

  const { ok, values, error } = parseFields(
    {
      initialDate: "date",
      endDate: "date",
      price: "number",
    },
    body
  );

  if(!ok) return res.status(400).json({ message: "Bad request " + error });

  const { professorId, activityId, currentSlots, slotsAvailable } = body;

  if (!professorId || !activityId) {
    return res.status(400).json({ message: "Missing required fields: professorId, activityId" });
  }

  const createInput: Prisma.appointmentCreateInput = {
    initialDate: values.initialDate as Date,
    endDate: values.endDate as Date,
    price: values.price as number,
    currentSlots: currentSlots !== undefined ? Number(currentSlots) : 0,
    slotsAvailable: slotsAvailable !== undefined ? Number(slotsAvailable) : 0,
    activity: { connect: { id: Number(activityId) } },
    professor: { connect: { id: Number(professorId) } },
  };
  
  try {
    const appointment = await createAppointment(createInput);
    return res.status(200).json(appointment);
    
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
}
