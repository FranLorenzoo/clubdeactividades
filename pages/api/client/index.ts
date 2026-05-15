import { getAllClients, createClient } from "@/lib/sql/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      return getAllClientsHandler(res);
    case "POST":
      return createClientHandler(req.body, res);
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
}

async function getAllClientsHandler(res: NextApiResponse) {
  try {
    const clients = await getAllClients();
    res.status(200).json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function createClientHandler(body: Record<string, unknown>, res: NextApiResponse) {
  const { suspended, active, userId } = body;

  if (suspended === undefined || active === undefined || !userId) {
    return res.status(400).json({ message: "Missing required fields: suspended, active, userId" });
  }

  try {
    const client = await createClient({
      suspended: Boolean(suspended),
      active: Boolean(active),
      user: { connect: { id: Number(userId) } },
    });
    res.status(201).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
