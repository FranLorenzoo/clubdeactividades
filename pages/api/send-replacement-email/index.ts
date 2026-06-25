import { transporter } from "@/lib/utils/nodemailer";
import { appointment, user } from "@/lib/generated/prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getAppointmentById } from "@/lib/sql/appointment";
import { getProfessorById } from "@/lib/sql/professor";



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }
  const { turno } = req.body;
  const appointment = await getAppointmentById(turno);
  if (!appointment) {
    return res.status(404).json({
        message: "Turno no encontrado",
    });
  }
  const professor = await getProfessorById(appointment.professorId);
  if (!professor) {
    return res.status(404).json({
        message: "Profesor no encontrado",
    });
  }

  sendReplacementEmail(professor.user, appointment, appointment.activity.name);

  return res.status(200).json({
    message: "Mail enviado",
  });
}

export async function sendReplacementEmail(
  professor: user,
  turno: appointment,
  activityName: string
) {
  try {
    await transporter.sendMail({
      from: professor.email,
      to: process.env.MAIL_USERNAME,
      subject: "Solicitud de reemplazo de turno",
      html: `
        <h2>Solicitud de reemplazo</h2>

        <p><strong>Profesor:</strong> ${professor.name} ${professor.lastName}</p>

        <p><strong>Actividad:</strong> ${activityName}</p>

        <p><strong>Fecha:</strong>
          ${new Date(turno.initialDate).toLocaleDateString("es-AR")}
        </p>

        <p>
          <strong>Horario:</strong>
          ${new Date(turno.initialDate).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          -
          ${new Date(turno.endDate).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <p>Solicita un reemplazo para este turno.</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error,
    };
  }
}