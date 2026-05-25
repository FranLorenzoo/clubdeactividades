import { transporter } from "../utils/nodemailer";
import { user } from "../generated/prisma/client";

export async function sendEmail(user: user) {
  try {
    const info = await transporter.sendMail({
      from: `"Club de Actividades" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Bienvenido a Club360',
      html: `<div style="font-family: Arial; max-width: 600px; margin: auto; padding: 40px; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb;">

            <h1 style="color: #111827; margin-bottom: 20px;">
                ¡Bienvenido ${user.name}!
            </h1>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                Tu cuenta fue creada correctamente.
            </p>

            <p style="color: #4b5563; font-size: 16px;">
                Para cambiar tu contraseña, hacé click en el siguiente botón:
            </p>

            <a
                href="http://localhost:3000/change-password/${user.id}"
                style="
                display: inline-block;
                margin-top: 20px;
                background: #16a34a;
                color: white;
                padding: 14px 24px;
                border-radius: 12px;
                text-decoration: none;
                font-weight: bold;
                "
            >
                Crear contraseña
            </a>

            <p style="margin-top: 30px; color: #9ca3af; font-size: 14px;">
                Si no solicitaste esta cuenta, podés ignorar este correo.
            </p>

            </div>
            `
    });

    console.log("Mail enviado:", info.messageId);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error enviando mail:", error);

    return {
      success: false,
      error,
    };
  }
}