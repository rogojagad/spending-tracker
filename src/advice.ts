import { ErrorHandler } from "@hono/hono";
import { SpendingTrackerError } from "./error/error.ts";

interface ZodErrorMessage {
  expected: string;
  code: string;
  message: string;
  path: string[];
}

export const onHandlerError: ErrorHandler = (err, c): Response => {
  if (err instanceof SpendingTrackerError) {
    const cause = err.cause;
    const message = err.message;

    return c.json({ cause, message }, 400);
  }

  return c.json({ message: "Internal Server Error" }, 500);
};
