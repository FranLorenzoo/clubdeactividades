import type { NextApiRequest, NextApiResponse } from "next";
import { getHTMLContent, transporter } from "@/lib/utils/nodemailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    const { to, subject, text } = req.body;

    await transporter.verify();
    console.log("SMTP listo");

    await transporter.sendMail({
      from: process.env.MAIL_USERNAME,
      to,
      subject,
      text,
      html: getHTMLContent()
    });

    return res.status(200).json({
      message: "Mail enviado",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error enviando mail",
    });
  }
}