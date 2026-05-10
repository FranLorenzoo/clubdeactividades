import { getEmployeeById, updateEmployee, deleteEmployee } from "@/lib/sql/employee";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseInt(req.query.id as string);

  if (req.method === "GET") {
    try {
      const employee = await getEmployeeById(id);
      if (!employee) return res.status(404).json({ message: "Employee not found" });
      res.status(200).json(employee);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    try {
      const employee = await updateEmployee(id, req.body);
      res.status(200).json(employee);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    try {
      const employee = await deleteEmployee(id);
      res.status(200).json(employee);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
