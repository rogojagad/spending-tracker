import { type ZodType } from "@zod/zod";
import { zValidator } from "@hono/zod-validator";
import { onZodValidationResult } from "./advice.ts";

export function validatePayload<S extends ZodType>(schema: S) {
  return zValidator(
    "json",
    schema,
    onZodValidationResult,
  );
}
