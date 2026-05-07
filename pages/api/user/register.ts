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
    const { email, dni, password } = req.body;

    const user = await prisma.user.create({
      data: {
        email,
        dni,
        password,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario" });
  }
}