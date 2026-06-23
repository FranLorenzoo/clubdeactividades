import { getCreditsByActivityId } from "@/lib/sql/credit";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const activityId = Number(req.query.activityId);
  if (isNaN(activityId)) return res.status(400).json({ message: "Invalid activityId" });

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const credits = await getCreditsByActivityId(activityId);
    return res.status(200).json(credits);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
}
