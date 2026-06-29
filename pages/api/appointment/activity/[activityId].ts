import { getAppointmentsByActivityId } from "@/lib/sql/appointment";
import { parseId } from "@/lib/validators/api";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  const activityId = parseId(req.query.activityId);
  const clientId = parseId(req.query.clientId);

  if (activityId === null) {
    return res.status(400).json({
      message: "Invalid activityId",
    });
  }

  try {
    const from = new Date();
    from.setHours(0, 0, 0, 0);

    const to = new Date(from);
    to.setMonth(to.getMonth() + 2);

    const appointments = await getAppointmentsByActivityId(
      activityId,
      from,
      to
    );

const filteredAppointments = appointments.filter((appointment) => {
  const hasSlots =
    appointment.currentSlots < appointment.slotsAvailable;

  if (clientId === null) {
    return hasSlots;
  }

  const alreadyReserved = appointment.userAppointments.some(
    (ua) =>
      ua.clientId === clientId &&
      ua.cancellationDate === null
  );

  return hasSlots && !alreadyReserved;
});

    return res.status(200).json(filteredAppointments);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
