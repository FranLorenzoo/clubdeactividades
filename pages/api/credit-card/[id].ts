import { getCreditCardById, updateCreditCard, deleteCreditCard } from "@/lib/sql/creditCard";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseInt(req.query.id as string);

  if (req.method === "GET") {
    try {
      const creditCard = await getCreditCardById(id);
      if (!creditCard) return res.status(404).json({ message: "Credit card not found" });
      res.status(200).json(creditCard);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    try {
      const creditCard = await updateCreditCard(id, req.body);
      res.status(200).json(creditCard);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    try {
      const creditCard = await deleteCreditCard(id);
      res.status(200).json(creditCard);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
