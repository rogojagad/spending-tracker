import dayjs from "dayjs";
import spendingRepository, { ISpending } from "../spending/repository.ts";
import limitRepository, { ILimit } from "./repository.ts";

export interface ILimitCheckResult extends ILimit {
  usedValue: number;
  usedPercentage: number;
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

  for (const limit of limits) {
    const { categoryId, sourceId, value } = limit;
    const currentTime = dayjs();
    const startOfMonth = currentTime.startOf("month");

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

const limitService = { checkAndCalculateLimitForSpending };

export default limitService;
