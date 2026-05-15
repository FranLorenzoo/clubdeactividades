import { getProfessorById, updateProfessor, deleteProfessor } from "@/lib/sql/professor";
import { parseId } from "@/lib/validators/api";
import { Prisma } from "@/lib/generated/prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const parsedId = parseId(req.query.id);
  if (parsedId === null) return res.status(400).json({ message: "Bad request" });

  switch (req.method) {
    case "GET":
      return getProfessorByIdHandler(parsedId, res);
    case "PUT":
      return updateProfessorByIdHandler(parsedId, req.body, res);
    case "DELETE":
      return deleteProfessorByIdHandler(parsedId, res);
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
}

async function getProfessorByIdHandler(id: number, res: NextApiResponse) {
  try {
    const professor = await getProfessorById(id);
    if (!professor) return res.status(404).json({ message: "Professor not found" });
    res.status(200).json(professor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function updateProfessorByIdHandler(id: number, body: Record<string, unknown>, res: NextApiResponse) {
  try {
    const data: Prisma.professorUpdateInput = {};
    if (body.activityId) data.activity = { connect: { id: Number(body.activityId) } };

    const professor = await updateProfessor(id, data);
    res.status(200).json(professor);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: "Professor not found" });
    }
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function deleteProfessorByIdHandler(id: number, res: NextApiResponse) {
  try {
    await deleteProfessor(id);
    res.status(200).json({ message: "Professor deleted" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: "Professor not found" });
    }
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
