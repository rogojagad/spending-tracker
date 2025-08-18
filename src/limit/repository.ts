import { sql } from "kysely";
import db from "../postgre.ts";
import { ISpending } from "../spending/repository.ts";

export const SPENDING_LIMIT_TABLE = "spending_limit";

export enum ApplicationPeriod {
  DATE2DATE = "DATE2DATE",
  MONTHLY = "MONTHLY",
  PAYDAY = "PAYDAY",
  WEEKLY = "WEEKLY",
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
  descriptionKeywords?: string[];
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
      "spendingLimit.descriptionKeywords as descriptionKeywords",
      "category.name as categoryName",
      "source.name as sourceName",
    ])
    .execute();

  return result;
};

const getAppliedLimitsByKeywords = async (
  keywords: string,
): Promise<ILimit[]> => {
  const result = await sql<ILimit>`
    SELECT * FROM spending_limit
    WHERE 
    CASE 
      WHEN ${keywords} = '' IS true THEN true
      WHEN ${keywords} = '' IS NULL THEN true
    ELSE
      (
        description_keywords IS NULL 
        OR array_length(description_keywords, 1) IS NULL
        OR to_tsvector('simple', ${keywords}::text) @@ to_tsquery('simple', 
          array_to_string(
            array(
              SELECT CASE 
                WHEN keyword LIKE '% %' THEN '(' || replace(keyword, ' ', ' <-> ') || ')'
                ELSE keyword 
              END
              FROM unnest(description_keywords) AS keyword
            ), 
            ' | '
          )
        )
      )
    END
  `
    .execute(db);

  return result.rows;
};

const limitRepository = {
  getAllWithCategoryAndSourceName,
  getAppliedLimitsByKeywords,
};

export default limitRepository;
