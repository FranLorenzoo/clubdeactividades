import { sendEmail } from "@/lib/email/emaiPassword";
import { getAllUsers, createUser, getUserByDNI } from "@/lib/sql/user";
import { parseFields } from "@/lib/validators/api";
import { NextApiRequest, NextApiResponse } from "next";
import { act, Activity } from "react";

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

    const existingDni = await getUserByDNI(values.dni as string);
    if(existingDni){
      return res.status(409).json({
        message: "El DNI ya existe",
      });
    }

    const reqBody: any = {
      email: values.email as string,
      password: values.password as string,
      dni: values.dni as string,
      age: values.age as number,
      name: values.name as string,
      lastName: values.lastName as string,
      isDeleted: false,
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
    await sendEmail(user);

    res.status(201).json(user);
  } catch (error) {

    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002"){
      return res.status(409).json({message: "El mail ya existe"})
    }

    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

