import { getAllUserAppointments, createUserAppointment } from "@/lib/sql/userAppointment";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const userAppointments = await getAllUserAppointments();
      res.status(200).json(userAppointments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "POST") {
    try {
      const userAppointment = await createUserAppointment(req.body);
      res.status(201).json(userAppointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
