import { getUserAppointmentById, updateUserAppointment, deleteUserAppointment } from "@/lib/sql/user-appointment";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseInt(req.query.id as string);

  if (req.method === "GET") {
    try {
      const userAppointment = await getUserAppointmentById(id);
      if (!userAppointment) return res.status(404).json({ message: "User appointment not found" });
      res.status(200).json(userAppointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    try {
      const userAppointment = await updateUserAppointment(id, req.body);
      res.status(200).json(userAppointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    try {
      const userAppointment = await deleteUserAppointment(id);
      res.status(200).json(userAppointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
