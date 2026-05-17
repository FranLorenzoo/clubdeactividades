import { getProfessorByUserId } from "@/lib/sql/professor";
import { parseId } from "@/lib/validators/api";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const userId = parseId(req.query.userId);
  if (userId === null) return res.status(400).json({ message: "Invalid userId" });

  try {
    const professor = await getProfessorByUserId(userId);
    if (!professor) return res.status(404).json({ message: "Professor not found" });
    return res.status(200).json(professor);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
