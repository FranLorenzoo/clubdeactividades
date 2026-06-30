import { transporter } from "../utils/nodemailer";

type PromotionEmailInput = {
  email: string;
  name: string;
  activityName: string;
  initialDate: Date;
};

export async function sendWaitingListPromotionEmail(input: PromotionEmailInput) {
  const { email, name, activityName, initialDate } = input;

  const dateLabel = initialDate.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeLabel = initialDate.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  try {
    const info = await transporter.sendMail({
      from: `"Club de Actividades" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "¡Tu reserva fue confirmada!",
      html: `<div style="font-family: Arial; max-width: 600px; margin: auto; padding: 40px; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb;">
              <h1 style="color: #111827; margin-bottom: 20px;">
                ¡Hola ${name}!
              </h1>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                Saliste de la lista de espera, tu reserva está confirmada.
              </p>
              <div style="margin-top: 24px; padding: 20px; background: #f3f4f6; border-radius: 12px;">
                <p style="color: #111827; font-size: 16px; margin: 0 0 8px;">
                  <strong>Actividad:</strong> ${activityName}
                </p>
                <p style="color: #111827; font-size: 16px; margin: 0 0 8px;">
                  <strong>Fecha:</strong> ${dateLabel}
                </p>
                <p style="color: #111827; font-size: 16px; margin: 0;">
                  <strong>Hora:</strong> ${timeLabel}
                </p>
              </div>
              <p style="margin-top: 30px; color: #9ca3af; font-size: 14px;">
                ¡Te esperamos!
              </p>
            </div>`,
    });

    console.log("Mail de lista de espera enviado:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error enviando mail de lista de espera:", error);
    return { success: false, error };
  }
}
