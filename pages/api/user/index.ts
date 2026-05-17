import { getAllUsers, createUser, getUserByDNI, getUserByEmail } from "@/lib/sql/user";
import { parseFields } from "@/lib/validators/api";
import { connect } from "http2";
import { NextApiRequest, NextApiResponse } from "next";
import { act, Activity } from "react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return getHandler(req, res);
  } else if (req.method === "POST") {
    return createUserHandler(req.body, res);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const keys = Object.keys(req.query);
  switch(keys.length) {
    case 0:
      return getAllUsersHandler(res);
    case 1:
      const key = keys[0];
      const value = req.query[key];
      if(typeof value !== "string") return res.status(400).json({ message: "Bad request invalid value" });

      if(key === "dni") {
        return searchUserByDNI(value, res);
      }

      return res.status(400).json({ message: "Invalid query param" });
    default:
      return res.status(400).json({ message: "Too many query params" });
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
      roleId: "number",
    }, body);
    
    if(values.roleId === 4) {
      if(typeof body.activityId !== "number") {
        return res.status(400).json({
        message:
          "activityId es requerido",
        });
      }
    }  

    if(!ok) return res.status(400).json({ message: "Bad request " + error });

    const reqBody: any = {
      email: values.email as string,
      password: values.password as string,
      dni: values.dni as string,
      age: values.age as number,
      name: values.name as string,
      lastName: values.lastName as string,
      role: {
        connect: { id: values.roleId as number },
      },
    };
    if(values.roleId === 1) {
      reqBody.client = {
        create: {
        suspended: false,
        active: true,
        },
      };
    }else if(values.roleId === 4) {
      reqBody.professor = {
        create: {
          activity: {
            connect: {
              id: Number(body.activityId)
            },
          },
        },
      };
    }else {
      reqBody.employee = {
        create: {},
      };
    }

    const user = await createUser(reqBody);
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function searchUserByDNI(dni: string, res: NextApiResponse) {
  try {
    const user = await getUserByDNI(dni);
    if(!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
