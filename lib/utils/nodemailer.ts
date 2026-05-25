import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});


export function getHTMLContent() {
  return `
    <div
      style="
        max-width:600px;
        margin:auto;
        padding:24px;
        font-family:Arial,sans-serif;
        background:#f5f5f5;
        border-radius:12px;
      "
    >

      <h1 style="color:#16a34a;">
        Reserva confirmada ✅
      </h1>

      <p
        style="
          margin-top:24px;
          color:#666;
          font-size:14px;
        "
      >
        Gracias por utilizar nuestro sistema.
      </p>

    </div>
  `;
}