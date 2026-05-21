import { getAllEmployees, createEmployee, getEmployeeByUserId, getEmployeeByUserDni } from "@/lib/sql/employee";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return getHandler(req, res);
  } else if (req.method === "POST") {
    return createEmployeeHandler(req.body, res);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const keys = Object.keys(req.query);
  if (keys.length === 0) {
    try {
      const employees = await getAllEmployees();
      return res.status(200).json(employees);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  const key = keys[0];
  const value = req.query[key];
  if (typeof value !== "string") return res.status(400).json({ message: "Bad request" });

  if (key === "userId") {
    const userId = Number(value);
    if (!Number.isInteger(userId) || userId <= 0) return res.status(400).json({ message: "Invalid userId" });
    try {
      const employee = await getEmployeeByUserId(userId);
      if (!employee) return res.status(404).json({ message: "Employee not found" });
      return res.status(200).json(employee);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  if (key === "dni") {
    const parsedDni = value.toString().trim();
    try {
      const employee = await getEmployeeByUserDni(parsedDni);
      if (!employee) return res.status(404).json({ message: "Employee not found" });
      return res.status(200).json(employee);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(400).json({ message: "Invalid query param" });
}

async function createEmployeeHandler(body: Record<string, unknown>, res: NextApiResponse) {
  const { userId } = body;
  if (!userId) return res.status(400).json({ message: "Missing required field: userId" });

  try {
    const employee = await createEmployee({
      user: { connect: { id: Number(userId) } },
    });
    res.status(201).json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}