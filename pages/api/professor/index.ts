import { getAllProfessors, createProfessor } from "@/lib/sql/professor";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      return getAllProfessorsHandler(res);
    case "POST":
      return createProfessorHandler(req.body, res);
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
}

async function getAllProfessorsHandler(res: NextApiResponse) {
  try {
    const professors = await getAllProfessors();
    res.status(200).json(professors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function createProfessorHandler(body: Record<string, unknown>, res: NextApiResponse) {
  const { userId, activityId } = body;

  if (!userId || !activityId) {
    return res.status(400).json({ message: "Missing required fields: userId, activityId" });
  }

  try {
    const professor = await createProfessor({
      user: { connect: { id: Number(userId) } },
      activity: { connect: { id: Number(activityId) } },
    });
    res.status(201).json(professor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
