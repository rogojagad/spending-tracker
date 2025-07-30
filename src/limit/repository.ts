import db from "../postgre.ts";

export const SPENDING_LIMIT_TABLE = "spending_limit";

export enum ApplicationPeriod {
  MONTHLY = "MONTHLY",
  PAYDAY = "PAYDAY",
}

/**
 * Represents a spending limit configuration.
 *
 * A limit can be applied to:
 *   - a specific category (across all sources),
 *   - a specific source (across all categories),
 *   - or a combination of both (a specific category within a specific source).
 *
 * At least one of `categoryId` or `sourceId` must be provided.
 *
 * @property {string} [id] - The unique identifier for the limit entry.
 * @property {string} name - The name or label for this limit (e.g., 'Food', 'Credit Card').
 * @property {number} value - The maximum allowed spending for the specified scope.
 * @property {string} [categoryId] - The ID of the category this limit applies to (optional if sourceId is provided).
 * @property {string} [sourceId] - The ID of the source this limit applies to (optional if categoryId is provided).
 */
export interface ILimit {
  id?: string;
  name: string;
  value: number;
  categoryId?: string;
  sourceId?: string;
  applicationPeriod: ApplicationPeriod;
}

interface ILimitWithCategoryAndSourceName extends ILimit {
  categoryName?: string | null;
  sourceName?: string | null;
}

const getAllWithCategoryAndSourceName = async (): Promise<
  ILimitWithCategoryAndSourceName[]
> => {
  const result = await db
    .selectFrom("spendingLimit")
    .leftJoin("category", "spendingLimit.categoryId", "category.id")
    .leftJoin("source", "spendingLimit.sourceId", "source.id")
    .select([
      "spendingLimit.id as id",
      "spendingLimit.name as name",
      "spendingLimit.value as value",
      "spendingLimit.categoryId as categoryId",
      "spendingLimit.sourceId as sourceId",
      "spendingLimit.applicationPeriod as applicationPeriod",
      "category.name as categoryName",
      "source.name as sourceName",
    ])
    .execute();

  return result;
};

const getManyAppliedLimitsByCategoryIdOrSourceId = async (
  categoryId: string,
  sourceId: string,
): Promise<ILimit[]> => {
  const result = await db.selectFrom("spendingLimit").selectAll().where((eb) =>
    eb.or([
      eb.and([
        eb("categoryId", "=", categoryId),
        eb("sourceId", "=", sourceId),
      ]),
      eb.and([
        eb("categoryId", "=", categoryId),
        eb("sourceId", "is", null),
      ]),
      eb.and([
        eb("categoryId", "is", null),
        eb("sourceId", "=", sourceId),
      ]),
    ])
  ).execute();

  return result;
};

const limitRepository = {
  getAllWithCategoryAndSourceName,
  getManyAppliedLimitsByCategoryIdOrSourceId,
};

export default limitRepository;
