import { getPaymentById, updatePayment, deletePayment } from "@/lib/sql/payment";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseInt(req.query.id as string);

  if (req.method === "GET") {
    try {
      const payment = await getPaymentById(id);
      if (!payment) return res.status(404).json({ message: "Payment not found" });
      res.status(200).json(payment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    try {
      const payment = await updatePayment(id, req.body);
      res.status(200).json(payment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    try {
      const payment = await deletePayment(id);
      res.status(200).json(payment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
