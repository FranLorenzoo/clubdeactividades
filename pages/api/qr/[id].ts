import { getQRById, updateQR, deleteQR } from "@/lib/sql/qr";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseInt(req.query.id as string);

  if (req.method === "GET") {
    try {
      const qr = await getQRById(id);
      if (!qr) return res.status(404).json({ message: "QR not found" });
      res.status(200).json(qr);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    try {
      const qr = await updateQR(id, req.body);
      res.status(200).json(qr);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    try {
      const qr = await deleteQR(id);
      res.status(200).json(qr);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
