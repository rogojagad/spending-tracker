import { GetManySpendingsFilterQueryParam } from "../spending/interface.ts";
import spendingRepository, { ISpending } from "../spending/repository.ts";
import limitRepository, { GetLimitsFilter, ILimit } from "./repository.ts";

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

const getLimitsExceededBySpending = async (spending: ISpending): Promise<
  ILimitCheckResultWithCategoryAndSourceName[]
> => {
  const checkResults: ILimitCheckResultWithCategoryAndSourceName[] = [];
  const limits = await limitRepository.getManyLimits(
    GetLimitsFilter.fromSpending(spending),
  );

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
