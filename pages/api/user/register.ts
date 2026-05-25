import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Método no permitido"
    });
  }

  try {

    const {
      email,
      password,
      name,
      lastName,
      age,
      dni,
      roleId
    } = req.body;

    // verificar email repetido
    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "El correo ya está registrado"
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password,
        name,
        lastName,
        age: Number(age),
        isDeleted: false,
        dni,
        isDeleted: false,
        role: {
          connect: {
            id: Number(roleId)
          }
        }
      }
    });

    return res.status(201).json(user);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Error al registrar usuario"
    });

  }
}