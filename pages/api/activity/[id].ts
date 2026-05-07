import { getActivityById, updateActivity, deleteActivity } from "@/lib/sql/activity";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseInt(req.query.id as string);

  if (req.method === "GET") {
    try {
      const activity = await getActivityById(id);
      if (!activity) return res.status(404).json({ message: "Activity not found" });
      res.status(200).json(activity);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    try {
      const activity = await updateActivity(id, req.body);
      res.status(200).json(activity);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    try {
      const activity = await deleteActivity(id);
      res.status(200).json(activity);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
