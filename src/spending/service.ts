import spendingRepository, {
  ISpendingWithCategoryNameAndSourceName,
} from "~/src/spending/repository.ts";
import { IGetManySpendingsFilterQueryParam } from "~/src/spending/interface.ts";
import dayjs from "dayjs";
import { timed } from "../utils/timed.ts";

interface ISpendingAmountSummaryForMonth {
  month: Date;
  total: number;
  summaries: IAmountForCategory[];
}

interface IAmountForCategory {
  amount: number;
  categoryName: string;
}

const getManySpendings = async (
  filter: IGetManySpendingsFilterQueryParam,
): Promise<
  ISpendingWithCategoryNameAndSourceName[]
> => {
  console.time(`Fetching spendings...`);
  const spendings = await spendingRepository
    .getSpendingsByCategoryIdSourceIdAndCreatedAtDatetimeRange(filter);
  console.timeEnd(`Fetching spendings...`);

  return spendings;
};

const getMonthlySpendingSummaries = async (): Promise<
  ISpendingAmountSummaryForMonth[]
> => {
  const monthAndCategoryNameSpendings = await spendingRepository
    .getSpendingSummariesGroupByMonthAndCategoryName();

  const summariesByMonth = new Map<string, IAmountForCategory[]>();

  monthAndCategoryNameSpendings.forEach((spending) => {
    const { month } = spending;
    const monthString = dayjs(month).format();
    const existingSummaryByMonth = summariesByMonth.get(monthString) || [];

    summariesByMonth.set(
      monthString,
      existingSummaryByMonth.concat({
        amount: spending.amount,
        categoryName: spending.categoryName,
      }),
    );
  });

  return summariesByMonth.entries().map((entry) => {
    const month = dayjs(entry[0]).toDate();
    const summaries = entry[1];
    const total = summaries.reduce((prev, next) => {
      return prev + next.amount;
    }, 0);

    return { month, total, summaries };
  }).toArray();
};

const spendingService = timed("spendingService", {
  getManySpendings,
  getMonthlySpendingSummaries,
});

export default spendingService;
