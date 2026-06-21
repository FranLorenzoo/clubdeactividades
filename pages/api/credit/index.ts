import { getAllCredits, createCredit } from "@/lib/sql/credit";
import { parseFields } from "@/lib/validators/api";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return getAllCreditsHandler(res);
  } else if (req.method === "POST") {
    return createCreditHandler(req.body, res);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

async function getAllCreditsHandler(res: NextApiResponse) {
  try {
    const credits = await getAllCredits();
    return res.status(200).json(credits);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function createCreditHandler(body: Record<string, unknown>, res: NextApiResponse) {
  const { ok, values, error } = parseFields(
    {
      endDate: "date",
      isValid: "boolean",
    },
    body
  );

  if (!ok) return res.status(400).json({ message: "Bad request: " + error });

  const { clientId, activityId } = body;
  if (!clientId || !activityId) {
    return res.status(400).json({ message: "Missing required fields: clientId, activityId" });
  }

  try {
    const credit = await createCredit({
      endDate: values.endDate as Date,
      isValid: values.isValid as boolean,
      client: { connect: { id: Number(clientId) } },
      activity: { connect: { id: Number(activityId) } },
    });
    return res.status(201).json(credit);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
}
