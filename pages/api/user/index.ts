import { getAllUsers, createUser } from "@/lib/sql/user";
import { parseFields } from "@/lib/validators/api";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return getAllUsersHandler(res);
  } else if (req.method === "POST") {
    return createUserHandler(req.body, res);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

async function getAllUsersHandler(res: NextApiResponse) {
  try {
    const users = await getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function createUserHandler(body: Record<string, unknown>, res: NextApiResponse) {
  try {
    const { ok, values, error } = parseFields({
      email: "string",
      password: "string",
      name: "string",
      lastName: "string",
      age: "number",
      dni: "string",
      roleId: "number"
    }, body); 

    if(!ok) return res.status(400).json({ message: "Bad request " + error });

    const reqBody = {
      email: values.email as string,
      password: values.password as string,
      dni: values.dni as string,
      age: values.age as number,
      name: values.name as string,
      lastName: values.lastName as string,
      role: {
        connect: { id: values.roleId as number },
      },
      client: {
        create: {
          suspended: false,
          active: true,
        },
      },
    };

    const user = await createUser(reqBody);
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

