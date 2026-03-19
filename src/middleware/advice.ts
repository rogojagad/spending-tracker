import { type Hook } from "@hono/zod-validator";
import { ErrorHandler } from "@hono/hono";
import { SpendingTrackerError } from "../error/error.ts";

export const onHandlerError: ErrorHandler = (err, c): Response => {
  if (err instanceof SpendingTrackerError) {
    const cause = err.cause;
    const message = err.message;

    return c.json({ cause, message }, 400);
  }

  return c.json({ message: "Internal Server Error" }, 500);
};

export const onZodValidationResult: Hook<any, any, any> = (
  result,
  c,
): Response | void => {
  if (!result.success) {
    const issues = result.error!.issues;

    const customErrorResponse = {
      status: 400,
      message: "Invalid payload",
      errors: issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };

    return c.json(customErrorResponse, 400);
  }
};
