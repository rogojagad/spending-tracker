import { sql } from "kysely";
import db from "../postgre.ts";

export const SPENDING_LIMIT_TABLE = "spending_limit";

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
}

interface ILimitWithCategoryAndSourceName
  extends Omit<ILimit, "categoryId" | "sourceId"> {
  categoryName?: string;
  sourceName?: string;
}

const getAllWithCategoryAndSourceName = async (): Promise<
  ILimitWithCategoryAndSourceName[]
> => {
  const result = await sql<ILimitWithCategoryAndSourceName>`
    select ${SPENDING_LIMIT_TABLE}.id as id, ${SPENDING_LIMIT_TABLE}.name as name, ${SPENDING_LIMIT_TABLE}.value as value, category.name as category_name, source.name as source_name
    from ${SPENDING_LIMIT_TABLE}
    join category on ${SPENDING_LIMIT_TABLE}.category_id = category.id
    join source on ${SPENDING_LIMIT_TABLE}.source_id = source.id
  `.execute(db);

  return result.rows;
};

const getManyAppliedLimitsByCategoryIdOrSourceId = async (
  categoryId: string,
  sourceId: string,
): Promise<ILimit[]> => {
  // const result = await sql<ILimit>`
  //   select * from ${SPENDING_LIMIT_TABLE}
  //   where (category_id = ${categoryId} and source_id = ${sourceId})
  //     or (category_id = ${categoryId} and source_id IS NULL)
  //     or (category_id IS NULL and source_id = ${sourceId})
  // `.execute(db);

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
