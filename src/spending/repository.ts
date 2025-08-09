import dayjs from "dayjs";
import db from "~/src/postgre.ts";
import { sql } from "kysely";
import { IGetManySpendingsFilterQueryParam } from "~/src/spending/interface.ts";

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

export interface ITotalSpendingAmountBySourceNameAndCategoryName {
  sourceName: string;
  categoryName: string;
  amount: number;
}

export interface ITotalSpendingAmountForMonthAndCategoryName {
  amount: number;
  month: Date;
  categoryName: string;
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
  }::timestamp
    and
      spending.created_at < ${
    toExclusive.format("YYYY-MM-DD HH:mm:ss")
  }::timestamp
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
  }::timestamp
    and
      spending.created_at < ${
    toExclusive.format("YYYY-MM-DD HH:mm:ss")
  }::timestamp
    order by
      category.priority asc,
      spending.created_at asc
  `.execute(db);

  return spendings.rows;
};

const getSpendingAmountPerCategoryWithSourceNeedSettlementCreatedAtDatetimeRange =
  async (
    fromInclusive: dayjs.Dayjs,
    toExclusive: dayjs.Dayjs,
  ): Promise<ITotalSpendingAmountBySourceNameAndCategoryName[]> => {
    const spendings = await sql<
      ITotalSpendingAmountBySourceNameAndCategoryName
    >`
    select 
      source.name as source_name, category.name as category_name, sum(spending.amount) as amount
    from 
      spending
    join category on category.id = spending.category_id
    join source on source.id = spending.source_id
    where
      source.is_settlement_needed = true
    and
      spending.created_at >= ${
      fromInclusive.format("YYYY-MM-DD HH:mm:ss")
    }::timestamp
    and
      spending.created_at < ${
      toExclusive.format("YYYY-MM-DD HH:mm:ss")
    }::timestamp
    group by 
      source.name, category.name, category.priority
    order by
      category.priority asc
  `.execute(db);

    return spendings.rows;
  };

const getSpendingsByCategoryIdSourceIdAndCreatedAtDatetimeRange = async (
  filter: IGetManySpendingsFilterQueryParam,
): Promise<ISpendingWithCategoryNameAndSourceName[]> => {
  const spendings = await sql<ISpendingWithCategoryNameAndSourceName>`
    select
      spending.id, spending.amount, spending.description, category.name as category_name, source.name as source_name, spending.created_at
    from spending
    join
      category on category.id = spending.category_id
    join
      source on source.id = spending.source_id
    where
      (spending.category_id = ${filter.category})
    and
      (spending.source_id = ${filter.source})
    and
      spending.created_at >= ${
    filter.createdAt.fromInclusive.format("YYYY-MM-DD HH:mm:ss")
  }::timestamp
    and
      spending.created_at < ${
    filter.createdAt.toExclusive.format("YYYY-MM-DD HH:mm:ss")
  }::timestamp
    order by
      spending.created_at desc,
      category.priority asc
  `.execute(
    db,
  );

  return spendings.rows;
};

const getSpendingSummariesGroupByMonthAndCategoryName = async (): Promise<
  ITotalSpendingAmountForMonthAndCategoryName[]
> => {
  const summaries = await sql<ITotalSpendingAmountForMonthAndCategoryName>`
    select 
      date_trunc('month', spending.created_at) as month,
      sum(spending.amount) as amount,
      category.name as category_name
    from spending 
    join category on category.id = spending.category_id
    group by month, category_name
    order by month desc
  `
    .execute(db);

  return summaries.rows;
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

const getTodaySpendingAmountToSettlePerSourceAndCategory = async (): Promise<
  ITotalSpendingAmountBySourceNameAndCategoryName[]
> => {
  return await getSpendingAmountPerCategoryWithSourceNeedSettlementCreatedAtDatetimeRange(
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
  getTodaySpendingAmountToSettlePerSourceAndCategory,
  getSpendingsByCategoryIdSourceIdAndCreatedAtDatetimeRange,
  getSpendingSummariesGroupByMonthAndCategoryName,
};

export default spendingRepository;
