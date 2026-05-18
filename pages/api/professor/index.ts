import { getAllProfessors, createProfessor, getProfessorsNamesByActivityId } from "@/lib/sql/professor";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      return getHandler(req, res);
    case "POST":
      return createProfessorHandler(req.body, res);
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
}

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const keys = Object.keys(req.query);

  switch(keys.length) {
    case 0:
      return getAllProfessorsHandler(res);
    case 1:
      const activityId = Number(req.query[keys[0]]);
      if(isNaN(activityId)) return res.status(400).json({ message: "Invalid query param" });
      
      return getProfessorsByActivityIdHandler(activityId, res);
    default:
      return res.status(400).json({ message: "Bad request" });
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


async function getProfessorsByActivityIdHandler(activityId: number, res: NextApiResponse) {
  try {
    const professors = await  getProfessorsNamesByActivityId(activityId);
    return res.status(200).json(professors);
  } catch(error) {
    res.status(500).json({ message: "Internal server error: " + error });
  }
}