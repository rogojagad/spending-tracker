import spendingRepository, {
  ISpendingWithCategoryNameAndSourceName,
} from "~/src/spending/repository.ts";
import { IGetManySpendingsFilterQueryParam } from "~/src/spending/interface.ts";

interface ISpendingAmountSummaryForMonth {
  month: Date;
  total: number;
  summaries: IAmountForCategory[];
}

interface IAmountForCategory {
  amount: number;
  categoryName: string;
}

const getManySpendings = (
  filter: IGetManySpendingsFilterQueryParam,
): Promise<
  ISpendingWithCategoryNameAndSourceName[]
> => {
  return spendingRepository
    .getSpendingsByCategoryIdSourceIdAndCreatedAtDatetimeRange(filter);
};

const getMonthlySpendingSummaries = async (): Promise<
  ISpendingAmountSummaryForMonth[]
> => {
  const monthAndCategoryNameSpendings = await spendingRepository
    .getSpendingSummariesGroupByMonthAndCategoryName();

  const summariesByMonth = new Map<Date, IAmountForCategory[]>();

  monthAndCategoryNameSpendings.forEach((spending) => {
    const existingSummaryByMonth = summariesByMonth.get(spending.month) || [];

    summariesByMonth.set(
      spending.month,
      existingSummaryByMonth.concat({
        amount: spending.amount,
        categoryName: spending.categoryName,
      }),
    );
  });

  return summariesByMonth.entries().map((entry) => {
    const month = entry[0];
    const summaries = entry[1];
    const total = summaries.reduce((prev, next) => {
      return prev + next.amount;
    }, 0);

    return { month, total, summaries };
  }).toArray();
};

const spendingService = { getManySpendings, getMonthlySpendingSummaries };

export default spendingService;
