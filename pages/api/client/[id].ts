import { getClientById, updateClient, deleteClient } from "@/lib/sql/client";
import { parseId } from "@/lib/validators/api";
import { Prisma } from "@/lib/generated/prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const parsedId = parseId(req.query.id);
  if (parsedId === null) return res.status(400).json({ message: "Bad request" });

  switch (req.method) {
    case "GET":
      return getClientByIdHandler(parsedId, res);
    case "PUT":
      return updateClientByIdHandler(parsedId, req.body, res);
    case "DELETE":
      return deleteClientByIdHandler(parsedId, res);
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
}

async function getClientByIdHandler(id: number, res: NextApiResponse) {
  try {
    const client = await getClientById(id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.status(200).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function updateClientByIdHandler(id: number, body: Record<string, unknown>, res: NextApiResponse) {
  try {
    const data: Prisma.clientUpdateInput = {};
    if (body.suspended !== undefined) data.suspended = Boolean(body.suspended);
    if (body.active !== undefined) data.active = Boolean(body.active);

    const client = await updateClient(id, data);
    res.status(200).json(client);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: "Client not found" });
    }
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function deleteClientByIdHandler(id: number, res: NextApiResponse) {
  try {
    await deleteClient(id);
    res.status(200).json({ message: "Client deleted" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: "Client not found" });
    }
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
