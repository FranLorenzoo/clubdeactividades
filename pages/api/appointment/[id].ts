import { getAppointmentById, updateAppointment, deleteAppointment } from "@/lib/sql/appointment";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseInt(req.query.id as string);

  if (req.method === "GET") {
    try {
      const appointment = await getAppointmentById(id);
      if (!appointment) return res.status(404).json({ message: "Appointment not found" });
      res.status(200).json(appointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    try {
      const appointment = await updateAppointment(id, req.body);
      res.status(200).json(appointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    try {
      const appointment = await deleteAppointment(id);
      res.status(200).json(appointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
