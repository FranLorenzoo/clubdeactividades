import { getAppointmentByStartDateAndActivity } from "@/lib/sql/appointment";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const { initialDate, activityId } = req.query;
  if (typeof initialDate !== "string" || !activityId) return res.status(400).json({ message: "Invalid params" });

  try {
    const appointment = await getAppointmentByStartDateAndActivity(new Date(initialDate), Number(activityId));

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    return res.status(200).json(appointment);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}