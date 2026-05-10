
import { CreateActivityDto } from "@/lib/dto/activity";
import { createActivity, getAllActivities } from "@/lib/sql/activity";
import { parseFields } from "@/lib/validators/apichecks";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 

  switch(req.method) {
    case "GET":
      return getAllActivitiesHandler(res);
    case "POST":
      return createActivityHandler(req.body, res);
    default:
      res.status(405).json({ message: "Method not allowed" });
  }

}

async function getAllActivitiesHandler(res: NextApiResponse) {
  try {
    const activities = await getAllActivities();
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function createActivityHandler(body: Record<string, unknown>, res: NextApiResponse) {

  const { ok, values, error } = parseFields(
    {
      name: "string",
      slotsAvailable: "number",
      price: "number"
    },
    body
  );

  if(!ok) return res.status(400).json({ message: "Bad request " + error });

  const dto = values as CreateActivityDto;
  
  try {
    const activity = await createActivity(dto);
    return res.status(200).json(activity);
    
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}