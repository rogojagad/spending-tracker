import { ErrorHandler } from "@hono/hono";
import { ZodError } from "@zod/zod";

interface ZodErrorMessage {
  expected: string;
  code: string;
  message: string;
  path: string[];
}

const onError: ErrorHandler = (err, c): Response => {
  if (err instanceof ZodError) {
    const errorMessage: ZodErrorMessage[] = JSON.parse(err.message);
    const simplified = errorMessage.map((it) => ({
      field: it.path[1],
      message: it.message,
      code: it.code,
    }));
    return c.json(simplified, 400);
  }

  return c.json({ message: "Internal Server Error" }, 500);
};

export default onError;
