import dayjs, { Dayjs } from "dayjs";
import { ILimit } from "../limit/repository.ts";
import * as Zod from "@zod/zod";
import {
  BulkCreateSpendingParamsSchema,
  CreateSpendingParamsSchema,
} from "./schemas.ts";

export interface IGetManySpendingsFilterQuery {
  category: string | null;
  source: string | null;
  descriptionKeywords: string[] | null;
  createdAt: IGetManySpendingsCreatedAtRangeFilter;

  /**
   * Convert array of string as keywords into PostgreSQL FTS compliant vector.
   *
   * For keywords consisted of more than 1 words join with ` <-> ` operand inside a `()` bracket.
   * E.g. "cafe latte" becomes "(cafe <-> latte)", "roasted pork belly" becomes "(roasted <-> pork <-> belly)".
   *
   * For singular keyword, return as is.
   *
   * Then for all keywords, join with " | " operand. Such as
   * ["americano", "cafe latte", "weekend takeaway coffee"]
   * becomes
   * "americano | (cafe <-> latte) | (weekend <-> takeaway <-> coffee)"
   *
   * If given null then will return empty string
   *
   * @returns string
   */
  descriptionKeywordsToVectorQuery(): string;
}

export interface IGetManySpendingsCreatedAtRangeFilter {
  fromInclusive: Dayjs;
  toExclusive: Dayjs;
}

export class GetManySpendingsFilterQuery
  implements IGetManySpendingsFilterQuery {
  category: string | null = null;
  source: string | null = null;
  descriptionKeywords: string[] | null = null;
  createdAt: IGetManySpendingsCreatedAtRangeFilter = {
    fromInclusive: dayjs(),
    toExclusive: dayjs(),
  };

  constructor(
    param: {
      category: string | null;
      source: string | null;
      descriptionKeywords: string[] | null;
      createdAtFromInclusive: Dayjs;
      createdAtToExclusive: Dayjs;
    },
  ) {
    this.category = param.category;
    this.source = param.source;
    this.descriptionKeywords = param.descriptionKeywords;
    this.createdAt = {
      fromInclusive: param.createdAtFromInclusive,
      toExclusive: param.createdAtToExclusive,
    };
  }

  static fromLimitAndCreatedAtRange(
    limit: ILimit,
    createdAt: IGetManySpendingsCreatedAtRangeFilter,
  ): GetManySpendingsFilterQuery {
    return new GetManySpendingsFilterQuery({
      category: limit.categoryId ?? null,
      source: limit.sourceId ?? null,
      descriptionKeywords: limit.descriptionKeywords ?? null,
      createdAtFromInclusive: createdAt.fromInclusive,
      createdAtToExclusive: createdAt.toExclusive,
    });
  }

  descriptionKeywordsToVectorQuery(): string {
    return this.descriptionKeywords?.map((keyword) => {
      const splittedKeyword = keyword.split(" ");
      if (splittedKeyword.length === 1) {
        return keyword;
      }

      return `(${splittedKeyword.join(" <-> ")})`;
    }).join(" | ") ?? "";
  }
}

export type CreateSpendingParams = Zod.infer<typeof CreateSpendingParamsSchema>;

export type BulkCreateSpendingParams = Zod.infer<
  typeof BulkCreateSpendingParamsSchema
>;
