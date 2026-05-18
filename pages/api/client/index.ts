import { getAllClients, createClient, getClientByUserDni } from "@/lib/sql/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      return getHandler(req, res);
    case "POST":
      return createClientHandler(req.body, res);
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
}

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const keys = Object.keys(req.query);

  switch(keys.length) {
    case 0:
      return getAllClientsHandler(res);
    case 1:
      const dni = req.query[keys[0]];
      if(!dni) return res.status(400).json({ message: "Invalid query param" });
      const parsedDni = dni.toString().trim()
      return getClientByDNI(parsedDni, res);
    default:
      return res.status(400).json({ message: "Bad request" });
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

async function getClientByDNI(dni: string, res: NextApiResponse) {

  try {
    const client = await getClientByUserDni(dni);
    if(!client) return res.status(404).json({ message: "Client Not Found" });
    return res.status(200).json(client);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}