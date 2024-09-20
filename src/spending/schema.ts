import zod from "zod";

export const createSpendingRequestValidator = zod.object({
  amount: zod.number(),
  description: zod.string(),
}).required();

export type CreateSpendingRequestPayload = zod.infer<
  typeof createSpendingRequestValidator
>;
