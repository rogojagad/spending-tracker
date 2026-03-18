import spendingRepository, {
  ISpending,
  ISpendingWithCategoryNameAndSourceName,
} from "~/src/spending/repository.ts";
import {
  BulkCreateSpendingParams,
  IGetManySpendingsFilterQuery,
} from "~/src/spending/interface.ts";
import dayjs from "dayjs";
import { stringify } from "@std/csv";
import categoryService from "../category/service.ts";
import sourceService from "../source/service.ts";
import { BulkCreateSpendingValidator } from "./bulkCreate/validator.ts";

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
  filter: IGetManySpendingsFilterQuery,
): Promise<
  ISpendingWithCategoryNameAndSourceName[]
> => {
  const spendings = await spendingRepository
    .getMany(filter);

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

const downloadMonthlySummary = async (): Promise<string> => {
  const summaries = await getMonthlySpendingSummaries();

  if (summaries.length === 0) {
    return "";
  }

  const flattenedSummary = summaries.map((summ) => {
    const month = dayjs(summ.month).format("YYYY-MM-DD");
    const total = summ.total;

    const categoryNameToTotal: Record<string, number> = {};

    summ.summaries.forEach((it) => {
      categoryNameToTotal[it.categoryName] = it.amount;
    });

    return {
      month,
      total,
      ...categoryNameToTotal,
    };
  });

  console.log(flattenedSummary);

  const columns = Object.keys(flattenedSummary[0]);
  return stringify(flattenedSummary, { columns });
};

const createManySpendings = async (
  payload: BulkCreateSpendingParams,
): Promise<ISpending[]> => {
  const [categories, sources] = await Promise.all([
    categoryService.getAll(),
    sourceService.getAll(),
  ]);

  const validator = new BulkCreateSpendingValidator(
    categories.map((category) => category.id!),
    sources.map((source) => source.id!),
  );
  const validationResult = validator.validate(payload);

  if (!validationResult.isValid()) {
    // do return 400
  }

  // create and return
  // using Promise.all is not optimal because it will initiate new N connections according to number of data
  // will be better if we use actual SQL create many
  const result = await Promise.all(
    payload.map((spending) => spendingRepository.createOneSpending(spending)),
  );

  return result;
};

const spendingService = {
  createManySpendings,
  getManySpendings,
  getMonthlySpendingSummaries,
  downloadMonthlySummary,
};

export default spendingService;
