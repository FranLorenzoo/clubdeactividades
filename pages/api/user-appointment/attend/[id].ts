import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const id = Number(req.query.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  try {
    const ua = await prisma.userAppointment.findUnique({
      where: { id },
      include: { qr: true, appointment: true },
    });

    if (!ua) {
      return res.status(404).json({ message: "UserAppointment no encontrado" });
    }

    if (ua.attended) {
      return res.status(409).json({ message: "Ya se tomó asistencia" });
    }

    if (ua.appointment.endDate.getTime() < Date.now()) {
      return res.status(409).json({ message: "No se puede tomar asistencia de un turno finalizado" });
    }

    const ops: Prisma.PrismaPromise<unknown>[] = [
      prisma.userAppointment.update({
        where: { id },
        data: { attended: true },
      }),
    ];

    if (ua.qr && !ua.qr.accepted) {
      ops.push(
        prisma.qR.update({
          where: { id: ua.qr.id },
          data: { accepted: true },
        })
      );
    }

    await prisma.$transaction(ops);

    return res.status(200).json({ message: "Asistencia registrada" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
