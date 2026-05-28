import { getAppointmentsByActivityId } from "@/lib/sql/appointment";
import { parseId } from "@/lib/validators/api";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const activityId = parseId(req.query.activityId);
  if (activityId === null) return res.status(400).json({ message: "Invalid activityId" });

  try {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setMonth(to.getMonth() + 2);
    const appointments = await getAppointmentsByActivityId(activityId, from, to);
    return res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
