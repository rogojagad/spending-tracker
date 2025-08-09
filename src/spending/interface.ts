import dayjs, { Dayjs } from "dayjs";
import { ILimit } from "../limit/repository.ts";

export interface IGetManySpendingsFilterQueryParam {
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
   * @returns string | null
   */
  descriptionKeywordsToVectorQuery(): string | null;
}

export interface IGetManySpendingsCreatedAtRangeFilter {
  fromInclusive: Dayjs;
  toExclusive: Dayjs;
}

export class GetManySpendingsFilterQueryParam
  implements IGetManySpendingsFilterQueryParam {
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
  ): GetManySpendingsFilterQueryParam {
    return new GetManySpendingsFilterQueryParam({
      category: limit.categoryId ?? null,
      source: limit.sourceId ?? null,
      descriptionKeywords: limit.descriptionKeywords ?? null,
      createdAtFromInclusive: createdAt.fromInclusive,
      createdAtToExclusive: createdAt.toExclusive,
    });
  }

  descriptionKeywordsToVectorQuery(): string | null {
    return this.descriptionKeywords?.map((keyword) => {
      const splittedKeyword = keyword.split(" ");
      if (splittedKeyword.length === 1) {
        return keyword;
      }

      return `(${splittedKeyword.join(" <-> ")})`;
    }).join(" | ") ?? null;
  }
}
