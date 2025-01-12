import dayjs from "dayjs";
import db from "~/src/postgre.ts";
import { sql } from "kysely";

export const SPENDING_TABLE = "spending";

export interface ISpending {
  id?: string;
  amount: number;
  description: string;
  createdAt?: Date;
  categoryId: string;
  sourceId: string;
}

export interface ISpendingWithCategoryNameAndSourceName
  extends Omit<ISpending, "categoryId"> {
  categoryName: string;
  sourceName: string;
}

export interface ITotalSpendingAmountByCategoryName {
  categoryName: string;
  amount: number;
}

const getAll = async (): Promise<ISpending[]> => {
  const result = await db.selectFrom(SPENDING_TABLE).selectAll().execute();

  return result;
};

const getOneById = async (id: string): Promise<ISpending | undefined> => {
  const result = await db.selectFrom(SPENDING_TABLE).where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

  return result;
};

const createOneSpending = async (spending: ISpending): Promise<ISpending> => {
  const result = await db.insertInto(SPENDING_TABLE).values(spending)
    .returningAll()
    .executeTakeFirst();

  if (!result) {
    throw new Error(
      `Failed to insert spending | ${JSON.stringify(spending, null, 2)}`,
    );
  }

  return result;
};

const getSpendingSummaryByDatetimeRangeGroupByCategoryName = async (
  fromInclusive: dayjs.Dayjs,
  toExclusive: dayjs.Dayjs,
): Promise<
  ITotalSpendingAmountByCategoryName[]
> => {
  const spendings = await sql<ITotalSpendingAmountByCategoryName>`
    select 
      category.name as category_name, sum(spending.amount) as amount
    from 
      spending
    join category on category.id = spending.category_id
    where
      spending.created_at >= ${
    fromInclusive.format("YYYY-MM-DD HH:mm:ss")
  }::timestamp AT TIME ZONE 'Asia/Jakarta'
    and
      spending.created_at < ${
    toExclusive.format("YYYY-MM-DD HH:mm:ss")
  }::timestamp AT TIME ZONE 'Asia/Jakarta'
    group by 
      category.name, category.priority
    order by
      category.priority asc
  `.execute(db);

  return spendings.rows;
};

const getAllSpendingsByDatetimeRangeSortByCategoryThenCreatedAt = async (
  fromInclusive: dayjs.Dayjs,
  toExclusive: dayjs.Dayjs,
): Promise<
  ISpendingWithCategoryNameAndSourceName[]
> => {
  const spendings = await sql<ISpendingWithCategoryNameAndSourceName>`
    select
      spending.id, spending.amount, spending.description, category.name as category_name, source.name as source_name, spending.created_at
    from spending
    join
      category on category.id = spending.category_id
    join
      source on source.id = spending.source_id
    where
      spending.created_at >= ${
    fromInclusive.format("YYYY-MM-DD HH:mm:ss")
  }::timestamp AT TIME ZONE 'Asia/Jakarta'
    and
      spending.created_at < ${
    toExclusive.format("YYYY-MM-DD HH:mm:ss")
  }::timestamp AT TIME ZONE 'Asia/Jakarta'
    order by
      category.priority asc,
      spending.created_at asc
  `.execute(db);

  return spendings.rows;
};

const getSpendingAmountWithSourceNameLikeCreatedAtDatetimeRange = async (
  sourceName: string,
  fromInclusive: dayjs.Dayjs,
  toExclusive: dayjs.Dayjs,
): Promise<number | undefined> => {
  const amount = await sql<{ amount: number }>`
    select sum(spending.amount) as amount
    from spending
    join source on source.id = spending.source_id
    where source.name like ${"%" + sourceName}
    and
      spending.created_at >= ${
    fromInclusive.format("YYYY-MM-DD HH:mm:ss")
  }::timestamp AT TIME ZONE 'Asia/Jakarta'
    and
      spending.created_at < ${
    toExclusive.format("YYYY-MM-DD HH:mm:ss")
  }::timestamp AT TIME ZONE 'Asia/Jakarta'
  `.execute(db);

  return amount.rows.pop()?.amount;
};

/*
 ***********************
 * Convenience Queries *
 **********************
 */
const getTodaySpendingSummary = async (): Promise<
  ITotalSpendingAmountByCategoryName[]
> => {
  return await getSpendingSummaryByDatetimeRangeGroupByCategoryName(
    dayjs().startOf("day"),
    dayjs().startOf("day").add(1, "day"),
  );
};

const getThisMonthSpendingSummary = async (): Promise<
  ITotalSpendingAmountByCategoryName[]
> => {
  return await getSpendingSummaryByDatetimeRangeGroupByCategoryName(
    dayjs().startOf("month").startOf("day"),
    dayjs().startOf("month").add(1, "month").startOf("day"),
  );
};

const getAllSpendingsThisMonth = async (): Promise<
  ISpendingWithCategoryNameAndSourceName[]
> => {
  return await getAllSpendingsByDatetimeRangeSortByCategoryThenCreatedAt(
    dayjs().startOf("month").startOf("day"),
    dayjs().startOf("month").add(1, "month").startOf("day"),
  );
};

const getTodayCreditCardTransactionToSettle = async (): Promise<
  number | undefined
> => {
  return await getSpendingAmountWithSourceNameLikeCreatedAtDatetimeRange(
    "Credit Card", // <-- actually not clean to hardcode like this. keeping it for simplicity's sake. if there are more spending sources need a settlement behavior, let's rework this.
    dayjs().startOf("day"),
    dayjs().startOf("day").add(1, "day"),
  );
};

const spendingRepository = {
  createOneSpending,
  getAll,
  getOneById,
  getTodaySpendingSummary,
  getThisMonthSpendingSummary,
  getAllSpendingsThisMonth,
  getTodayCreditCardTransactionToSettle,
};

export default spendingRepository;
