import { getAllQRs, createQR } from "@/lib/sql/qr";
import { Prisma } from "@/lib/generated/prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return createQRHandler(req.body, res);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

async function createQRHandler(body: Record<string, unknown>, res: NextApiResponse) {
  const { accepted, userAppointmentId, qrImage, url } = body;

  if (accepted === undefined || !userAppointmentId || !qrImage || !url) {
    return res.status(400).json({ message: "Missing required fields: accepted, userAppointmentId, qrImage, url" });
  }

  const createInput: Prisma.QRCreateInput = {
    accepted: Boolean(accepted),
    qrImage: String(qrImage),
    url: String(url),
    userAppointment: { connect: { id: Number(userAppointmentId) } },
  };

  try {
    const qr = await createQR(createInput);
    res.status(201).json(qr);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
