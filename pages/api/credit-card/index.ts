import { createCreditCard } from "@/lib/sql/creditCard";
import { Prisma } from "@/lib/generated/prisma/client";
import { parseFields } from "@/lib/validators/api";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return createCreditCardHandler(req.body, res);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

async function createCreditCardHandler(body: Record<string, unknown>, res: NextApiResponse) {
  const { ok, values, error } = parseFields({
    cardNumber: "string",
    securityCode: "string",
    cardHolder: "string",
    expireDate: "date",
  }, body);

  if (!ok) return res.status(400).json({ message: "Bad request " + error });

  const { clientId } = body;
  if (!clientId) return res.status(400).json({ message: "Missing required field: clientId" });

  const createInput: Prisma.creditCardCreateInput = {
    cardNumber: values.cardNumber as string,
    securityCode: values.securityCode as string,
    cardHolder: values.cardHolder as string,
    expireDate: values.expireDate as Date,
    client: { connect: { id: Number(clientId) } },
  };

  try {
    const creditCard = await createCreditCard(createInput);
    res.status(201).json(creditCard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
