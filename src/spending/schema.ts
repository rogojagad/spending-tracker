import zod from "zod";

export const createSpendingRequestSchema = zod.object({
  amount: zod.bigint(),
  description: zod.string(),
  categoryId: zod.string(),
}).required();

export type CreateSpendingRequestPayload = zod.infer<
  typeof createSpendingRequestSchema
>;
