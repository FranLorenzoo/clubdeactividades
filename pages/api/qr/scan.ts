import { NextApiRequest, NextApiResponse } from "next";
import { getQRByUserAppointmentId } from "@/lib/sql/qr";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const rawId = req.body?.userAppointmentId;
  const userAppointmentId = parseInt(String(rawId), 10);

  if (isNaN(userAppointmentId)) {
    return res.status(400).json({ message: "userAppointmentId inválido" });
  }

  try {
    const qr = await getQRByUserAppointmentId(userAppointmentId);

    if (!qr) {
      return res.status(404).json({ message: "QR no encontrado" });
    }

    if (qr.accepted) {
      return res.status(409).json({ message: "Ya fue usado" });
    }

    await prisma.$transaction([
      prisma.qR.update({
        where: { id: qr.id },
        data: { accepted: true },
      }),
      prisma.userAppointment.update({
        where: { id: qr.userAppointmentId },
        data: { attended: true },
      }),
    ]);

    return res.status(200).json({
      message: "QR validado correctamente",
      userAppointmentId: qr.userAppointmentId,
      userAppointment: qr.userAppointment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
