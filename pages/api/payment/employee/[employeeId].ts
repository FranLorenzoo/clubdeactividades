import { getPaymentsByEmployeeId } from "@/lib/sql/payment";
import { parseId } from "@/lib/validators/api";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const employeeId = parseId(req.query.employeeId);
  if (employeeId === null) return res.status(400).json({ message: "Invalid employeeId" });

  try {
    const payments = await getPaymentsByEmployeeId(employeeId);
    return res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
