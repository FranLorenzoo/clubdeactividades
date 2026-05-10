import { NextApiRequest, NextApiResponse } from "next";
import { deleteAppointment, getAppointmentById, updateAppointment } from "@/lib/sql/appointment";
import { parseFields, parseId } from "@/lib/validators/apichecks";
import { Prisma } from "@/lib/generated/prisma/client";
import { CreateAppointmentDto } from "@/lib/dto/appointment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
  const { id } = req.query;
  const parsedId = parseId(id);
  if(parsedId === null) return res.status(400).json({ message: "Bad request" });

  switch(req.method) {
    case "GET":
      return getAppointmentByIdHandler(parsedId, res);
    case "PUT":
      return updateAppointmentByIdHandler(parsedId, req.body, res);
    case "DELETE":
      return deleteAppointmentByIdHandler(parsedId, res);
    default:
      res.status(405).json({ message: "Method not allowed" });  
  }
  
}

async function getAppointmentByIdHandler(id: number, res: NextApiResponse) {
  try {
    const appointment = await getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    return res.status(200).json(appointment);

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function updateAppointmentByIdHandler(id: number, body: Record<string, unknown>, res: NextApiResponse) {
  const { ok, values, error} = parseFields({
    initialDate: "date",
    endDate: "date",
    currentSlots: "number",
    slotsAvailable: "number"
  }, body);

  if(!ok) return res.status(400).json({ message: "Bad request " + error });

  const dto = values as CreateAppointmentDto;

  try {
    const appointment = await updateAppointment(id, dto);
    return res.status(200).json(appointment);

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({
          message: "Appointment not found"
        });
      }
    }
    res.status(500).json({ message: "Internal server error" }); 
  }
}

async function deleteAppointmentByIdHandler(id: number, res: NextApiResponse) {
  try { 
    await deleteAppointment(id);
    return res.status(200).json({ message: "Appointment deleted" });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({
          message: "Appointment not found"
        });
      }
    }
    res.status(500).json({ message: "Internal server error" }); 
  }
}