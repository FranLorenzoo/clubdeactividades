import { getQRByUserAppointmentId } from "@/lib/sql/qr";
import { parseId } from "@/lib/validators/api";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const userAppointmentId = parseId(req.query.userAppointmentId);
  if (userAppointmentId === null) return res.status(400).json({ message: "Invalid userAppointmentId" });

  try {
    const qr = await getQRByUserAppointmentId(userAppointmentId);
    if (!qr) return res.status(404).json({ message: "QR not found" });
    return res.status(200).json(qr);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
