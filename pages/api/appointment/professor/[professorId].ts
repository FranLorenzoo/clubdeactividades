import { getAppointmentsByProfessorId } from "@/lib/sql/appointment";
import { parseId } from "@/lib/validators/api";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const professorId = parseId(req.query.professorId);
  if (professorId === null) return res.status(400).json({ message: "Invalid professorId" });

  try {
    const appointments = await getAppointmentsByProfessorId(professorId);
    return res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
