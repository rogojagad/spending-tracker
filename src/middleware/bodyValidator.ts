import { Context, Next } from "@hono/hono";
import { ZodObject, ZodRawShape } from "zod";

export const bodyValidator = <T extends ZodRawShape>(schema: ZodObject<T>) => {
  return async function (context: Context, next: Next) {
    const validationResult = schema.safeParse(await context.req.json());

    if (!validationResult.success) {
      const err = validationResult.error;
      const errorDetails = err.issues.map((issue) => ({
        code: issue.code,
        path: issue.path,
      }));

      return context.json({ data: errorDetails }, 400);
    }

    await next();
  };
};
