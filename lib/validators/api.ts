type ParsedResult = {
  ok: boolean;
  values: Record<string, any>;
  error?: string;
};


export function parseId(id: string | string[] | undefined): number | null {
  if(!id) return null;

  if(Array.isArray(id)) return null;

  const parsedId = Number(id);
  if(!Number.isInteger(parsedId) || parsedId <= 0) return null;

  return parsedId;
}

export function parseFields(schema: Record<string, "number" | "string" | "date">, input: any): ParsedResult {
  const result: Record<string, any> = {};

  for (const key in schema) {
    const type = schema[key];
    const value = input[key];

    if (value == null) {
      return { ok: false, values: {}, error: `Missing field: ${key}` };
    }

    if (type === "number") {
      const parsed = Number(value);
      if (isNaN(parsed)) return { ok: false, values: {}, error: `Invalid number: ${key}` };
      result[key] = parsed;
    }

    if (type === "string") {
      if (typeof value !== "string") return { ok: false, values: {}, error: `Invalid string: ${key}` };
      result[key] = value;
    }

    if (type === "date") {
      const parsed = new Date(value);
      if (isNaN(parsed.getTime())) return { ok: false, values: {}, error: `Invalid date: ${key}` };
      result[key] = parsed;
    }
  }

  return { ok: true, values: result };
}