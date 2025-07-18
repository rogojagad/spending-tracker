import dayjs from "dayjs";
import spendingRepository, { ISpending } from "../spending/repository.ts";
import limitRepository, { ILimit } from "./repository.ts";

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
export const MONTHLY_LIMIT_THRESHOLD_PERCENTAGE = 60.00;

const checkAndCalculateLimitForSpending = async (
  spending: ISpending,
): Promise<ILimitCheckResult[]> => {
  const checkResults: ILimitCheckResult[] = [];
  const limits = await limitRepository
    .getManyAppliedLimitsByCategoryIdOrSourceId(
      spending.categoryId,
      spending.sourceId,
    );
  const currentTime = dayjs();
  const startOfMonth = currentTime.startOf("month");

  for (const limit of limits) {
    const { categoryId, sourceId, value } = limit;

    const spendings = await spendingRepository
      .getSpendingsByCategoryIdSourceIdAndCreatedAtDatetimeRange({
        category: categoryId || null,
        source: sourceId || null,
        createdAt: {
          fromInclusive: startOfMonth,
          toExclusive: currentTime,
        },
      });

    const usedValue = spendings.reduce((prev, current) => {
      return prev + current.amount;
    }, 0);

    const usedPercentage = (usedValue / value) * 100;

    if (usedPercentage >= MONTHLY_LIMIT_THRESHOLD_PERCENTAGE) {
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
  console.log(`Fetching limits...`);
  const limits = await limitRepository.getAllWithCategoryAndSourceName();
  const currentTime = dayjs();
  const startOfMonth = currentTime.startOf("month");

  console.log(`Fetching spendings for each limit...`);
  const spendingsForEachLimit = await Promise.all(limits.map(
    (limit) => {
      return spendingRepository
        .getSpendingsByCategoryIdSourceIdAndCreatedAtDatetimeRange({
          category: limit.categoryId || null,
          source: limit.sourceId || null,
          createdAt: {
            fromInclusive: startOfMonth,
            toExclusive: currentTime,
          },
        });
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
  checkAndCalculateLimitForSpending,
  getAndCalculateAllLimitUsage,
};

export default limitService;
