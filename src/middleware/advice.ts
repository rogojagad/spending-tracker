import { type Hook } from "@hono/zod-validator";
import { ErrorHandler } from "@hono/hono";
import { ErrorCode, SpendingTrackerError } from "../error/error.ts";

interface ErrorResponse {
  code: string;
  errors: Record<string, unknown> | Record<string, unknown>[];
}

export const onHandlerError: ErrorHandler = (err, c): Response => {
  if (err instanceof SpendingTrackerError) {
    const errors = err.cause as Record<string, unknown>;
    const code = err.message;
    const errorResponse: ErrorResponse = { code, errors };

    return c.json(errorResponse, 400);
  }

  console.log(err);
  return c.json({ code: "Internal Server Error" }, 500);
};

export const onZodValidationResult: Hook<any, any, any> = (
  result,
  c,
): Response | void => {
  if (!result.success) {
    const issues = result.error!.issues;

    const customErrorResponse: ErrorResponse = {
      code: ErrorCode.INVALID_PAYLOAD,
      errors: issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };

    return c.json(customErrorResponse, 400);
  }
};
