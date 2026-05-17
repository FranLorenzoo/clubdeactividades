import { getCreditCardByClientId } from "@/lib/sql/creditCard";
import { parseId } from "@/lib/validators/api";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const clientId = parseId(req.query.clientId);
  if (clientId === null) return res.status(400).json({ message: "Invalid clientId" });

  try {
    const creditCard = await getCreditCardByClientId(clientId);
    if (!creditCard) return res.status(404).json({ message: "Credit card not found" });
    return res.status(200).json(creditCard);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
