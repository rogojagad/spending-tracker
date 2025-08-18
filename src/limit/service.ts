import { GetManySpendingsFilterQueryParam } from "../spending/interface.ts";
import spendingRepository, { ISpending } from "../spending/repository.ts";
import limitRepository, { ILimit } from "./repository.ts";

import applicationDateCalculator from "./util/applicationDateCalculator.ts";

export interface ILimitCheckResult extends ILimit {
  usedValue: number;
  usedPercentage: number;
}

export interface ILimitCheckResultWithCategoryAndSourceName
  extends ILimitCheckResult {
  categoryName?: string | null;
  sourceName?: string | null;
}

/**
 * When limit value is already 60% used, then needs to alert.
 */
export const LIMIT_THRESHOLD_PERCENTAGE = 60.00;

/*
 * Example limit configurations:
 * - Kopi Mahal (source: kartu kredit, desc: kopi)
 * - Kopi Murah (category: secondary, desc: kopi)
 * - Kopi Kantor (source: bank A account, category: primary, desc: kopi)
 *
 * Example spending: "kopi, category: secondary, source: kartu kredit"
 * - should match "Kopi Mahal" limit only -- match on the source
 *
 * Example spending: "kopi, category: secondary, source: bank A account"
 * - should match "Kopi Murah" limit only -- match on the category
 *
 * Example spending: "kopi, category: primary, source: bank A account"
 * - should match "Kopi Kantor" limit only -- match on the category and source
 */

const getLimitsExceededBySpending = async (spending: ISpending): Promise<
  ILimitCheckResultWithCategoryAndSourceName[]
> => {
  const checkResults: ILimitCheckResultWithCategoryAndSourceName[] = [];
  const limits = (await limitRepository.getAppliedLimitsByKeywords(
    spending.description,
  )).filter((limit) => {
    // Only apply limit if both source and category match
    // If limit has only sourceId, check only sourceId
    // If limit has only categoryId, check only categoryId
    // If limit has both, check both
    if (limit.sourceId && limit.categoryId) {
      return limit.sourceId === spending.sourceId &&
        limit.categoryId === spending.categoryId;
    } else if (limit.sourceId) {
      return limit.sourceId === spending.sourceId;
    } else if (limit.categoryId) {
      return limit.categoryId === spending.categoryId;
    }
    return false;
  });

  for (const limit of limits) {
    const { categoryId, sourceId, value } = limit;

    const createdAtRange = await applicationDateCalculator
      .calculateLimitApplicationDateRange(limit);

    const spendings = await spendingRepository
      .getSpendingsByCategoryIdSourceIdAndCreatedAtDatetimeRange(
        new GetManySpendingsFilterQueryParam({
          category: categoryId || null,
          source: sourceId || null,
          descriptionKeywords: null,
          createdAtFromInclusive: createdAtRange.fromInclusive,
          createdAtToExclusive: createdAtRange.toExclusive,
        }),
      );

    const usedValue = spendings.reduce((prev, current) => {
      return prev + current.amount;
    }, 0);

    const usedPercentage = (usedValue / value) * 100;

    if (usedPercentage >= LIMIT_THRESHOLD_PERCENTAGE) {
      checkResults.push({
        ...limit,
        usedValue,
        usedPercentage,
      });
    }
  }

  return checkResults;
};

const getAndCalculateAllLimitUsage = async (): Promise<
  ILimitCheckResultWithCategoryAndSourceName[]
> => {
  const limits = await limitRepository.getAllWithCategoryAndSourceName();

  const spendingsForEachLimit = await Promise.all(limits.map(
    async (limit) => {
      const createdAtRange = await applicationDateCalculator
        .calculateLimitApplicationDateRange(limit);

      return spendingRepository
        .getSpendingsByCategoryIdSourceIdAndCreatedAtDatetimeRange(
          GetManySpendingsFilterQueryParam.fromLimitAndCreatedAtRange(
            limit,
            createdAtRange,
          ),
        );
    },
  ));

  /**
   * `Promise.all` guarantee the resulting array item's order is the same as the promise passed, regardless of the completion order.
   * Link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all#return_value
   *
   * So, safe to assume:
   * - `spendingsForEachLimit[0]` is for `limits[0]`
   * - `spendingsForEachLimit[1]` is for `limits[1]`
   * - ...
   */

  return limits.map((limit, index) => {
    const spendings = spendingsForEachLimit[index];
    const usedValue = spendings.reduce((prev, current) => {
      return prev + current.amount;
    }, 0);
    const usedPercentage = (usedValue / limit.value) * 100;

    return { ...limit, usedValue, usedPercentage };
  });
};

const limitService = {
  getLimitsExceededBySpending,
  getAndCalculateAllLimitUsage,
};

export default limitService;
