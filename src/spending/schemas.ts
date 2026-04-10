import * as Zod from "@zod/zod";

export const CreateSpendingParamsSchema = Zod.object({
  sourceId: Zod.uuid(),
  categoryId: Zod.uuid(),
  description: Zod.string().max(512),
  amount: Zod.number().positive().min(0),
});

export const BulkCreateSpendingParamsSchema = Zod.array(
  CreateSpendingParamsSchema,
);
