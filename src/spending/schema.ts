import zod from "zod";

export const createSpendingRequestSchema = zod.object({
  amount: zod.number(),
  description: zod.string(),
}).required();

export type CreateSpendingRequestPayload = zod.infer<
  typeof createSpendingRequestSchema
>;
