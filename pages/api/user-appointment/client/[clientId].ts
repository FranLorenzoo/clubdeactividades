import { getUserAppointmentsByClientId } from "@/lib/sql/userAppointment";
import { parseId } from "@/lib/validators/api";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const clientId = parseId(req.query.clientId);
  if (clientId === null) return res.status(400).json({ message: "Invalid clientId" });

  try {
    const userAppointments = await getUserAppointmentsByClientId(clientId);
    return res.status(200).json(userAppointments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
