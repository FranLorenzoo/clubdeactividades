import { prisma } from "@/lib/prisma";
import { parseId } from "@/lib/validators/api";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const appointmentId = parseId(req.query.appointmentId);
  if (appointmentId === null) return res.status(400).json({ message: "Invalid appointmentId" });

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        slotsAvailable: true,
        userAppointments: {
          where: { state: { not: "CANCELLED" } },
          orderBy: [{ reservationDate: "asc" }, { id: "asc" }],
          select: {
            id: true,
            clientId: true,
            type: true,
            reservationDate: true,
            client: {
              select: {
                user: { select: { name: true, lastName: true } },
              },
            },
          },
        },
      },
    });

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const waitingEntries = appointment.userAppointments.slice(appointment.slotsAvailable).map((ua) => ({
      id: ua.id,
      clientId: ua.clientId,
      name: ua.client.user.name,
      lastName: ua.client.user.lastName,
      type: ua.type,
      reservationDate: ua.reservationDate,
    }));

    return res.status(200).json({
      generalWaitingList: waitingEntries,
      abonadosWaitingList: waitingEntries.filter((e) => e.type === "ABONADO"),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
