import { getCreditById, updateCredit, deleteCredit } from "@/lib/sql/credit";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });

  if (req.method === "GET") {
    return getCreditByIdHandler(id, res);
  } else if (req.method === "PUT") {
    return updateCreditHandler(id, req.body, res);
  } else if (req.method === "DELETE") {
    return deleteCreditHandler(id, res);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

async function getCreditByIdHandler(id: number, res: NextApiResponse) {
  try {
    const credit = await getCreditById(id);
    if (!credit) return res.status(404).json({ message: "Credit not found" });
    return res.status(200).json(credit);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function updateCreditHandler(id: number, body: Record<string, unknown>, res: NextApiResponse) {
  try {
    const data: Record<string, unknown> = {};
    if (body.endDate !== undefined) data.endDate = new Date(body.endDate as string);
    if (body.isValid !== undefined) data.isValid = Boolean(body.isValid);
    if (body.activityId !== undefined) data.activity = { connect: { id: Number(body.activityId) } };
    if (body.clientId !== undefined) data.client = { connect: { id: Number(body.clientId) } };

    const credit = await updateCredit(id, data);
    return res.status(200).json(credit);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function deleteCreditHandler(id: number, res: NextApiResponse) {
  try {
    await deleteCredit(id);
    return res.status(204).end();
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
}
