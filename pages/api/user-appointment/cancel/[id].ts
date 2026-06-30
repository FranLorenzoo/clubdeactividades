import { NextApiRequest, NextApiResponse } from "next";
import { cancelUserAppointment } from "@/lib/sql/user-appointment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const id = Number(req.query.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  return handleDeleteUserAppointment(id, res);
}

async function handleDeleteUserAppointment(id: number, res: NextApiResponse) {
  try {
    const result = await cancelUserAppointment(id);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error en cancelación: " + err);
    return res.status(500).json({ message: "Internal server error" });
  }
}