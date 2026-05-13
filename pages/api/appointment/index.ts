import { CreateAppointmentDto } from "@/lib/dto/appointment";
import { createAppointment, getAllAppointments } from "@/lib/sql/appointment";
import { parseFields } from "@/lib/validators/api";
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
      currentSlots: "number",
      slotsAvailable: "number"
    },
    body
  );

  if(!ok) return res.status(400).json({ message: "Bad request " + error });

  const dto = values as CreateAppointmentDto;

  const { professorId, activityId } = body;
  if(professorId) dto.professorId = Number(professorId);
  if(activityId) dto.activityId = Number(activityId);
  
  try {
    const appointment = await createAppointment(dto);
    return res.status(200).json(appointment);
    
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
}
