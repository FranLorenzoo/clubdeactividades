import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
      const { email, password, name, lastName, age, dni, roleId } = req.body;

      if (!email || !password || !name || !lastName || !age || !dni || !roleId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const user = await prisma.user.create({
        data: {
          email,
          password,
          name,
          lastName,
          age: Number(age),
          dni,
          role: { connect: { id: Number(roleId) } },
        },
      });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario" });
  }
}