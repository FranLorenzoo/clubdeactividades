import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
  if (req.method === "GET") { 
    try { 
      const user = await prisma.user.findMany(); 
      if (!user) { 
        return res.status(404).json({ message: "User not found" }); 
      } 
      res.status(200).json(user); 
    } catch (error) {
      console.log(error) 
      res.status(500).json({ message: "Internal server error" }); 
    } 
  } else { 
    res.status(405).json({ message: "sos puto" }); 
  } 
}