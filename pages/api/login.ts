import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    if (user.isDeleted) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Nota: en producción la password debe estar hasheada. Aquí comparamos plaintext solo para desarrollo.
    if (user.password !== password) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const role = assignRole(user.roleId);

    // Respuesta mínima. Más adelante se puede devolver JWT o session.
    return res.status(200).json({ id: user.id, email: user.email, role: role });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
}

function assignRole(roleId: number) {
  switch(roleId) {
    case 1:
      return "CLIENT";
    case 2:
      return "ADMIN";
    case 3: 
      return "EMPLOYEE";
    case 4:
      return "PROFESSOR";
    default:
      return "NONE";
  }
}

