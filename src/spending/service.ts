import spendingRepository, {
  ISpendingWithCategoryNameAndSourceName,
} from "~/src/spending/repository.ts";
import { IGetManySpendingsFilterQueryParam } from "~/src/spending/interface.ts";
import dayjs from "dayjs";
import categoryService from "../category/service.ts";

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
  const spendings = await spendingRepository
    .getSpendingsByCategoryIdSourceIdAndCreatedAtDatetimeRange(filter);

  return spendings;
};

const getMonthlySpendingSummaries = async (): Promise<
  ISpendingAmountSummaryForMonth[]
> => {
  const monthAndCategorySpendings = await spendingRepository
    .getSpendingSummariesGroupByMonthAndCategory();
  const categories = await categoryService.getAll();

  const spendingSummariesByMonth = Object.groupBy(
    monthAndCategorySpendings,
    (it) => dayjs(it.month).format(),
  );

  return Object.keys(spendingSummariesByMonth).map((month) => {
    const monthSummaries = spendingSummariesByMonth[month];
    const total = monthSummaries!.reduce((prev, curr) => {
      return prev + curr.amount;
    }, 0);

    /**
     * - Map from `categories` coz it is already sorted by `priority` when fetched from DB. We want to persists the order.
     * - If there are no spendings for this category in a month, return 0
     */
    const summaries: IAmountForCategory[] = categories.map((it) => {
      const categorySummary = monthSummaries?.find((monthSummary) =>
        monthSummary.categoryId === it.id!
      );

      return {
        categoryName: it.name,
        amount: categorySummary?.amount ?? 0,
      };
    });

    return {
      total,
      month: dayjs(month).toDate(),
      summaries,
    };
  }).sort((a, b) => {
    return dayjs(a.month).isBefore(b.month) ? 1 : -1;
  });
};

const spendingService = {
  getManySpendings,
  getMonthlySpendingSummaries,
};

export default spendingService;
