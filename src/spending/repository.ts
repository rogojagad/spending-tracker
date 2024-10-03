import sql from "~/src/postgre.ts";
import dayjs from "dayjs";

export interface ISpending {
  id?: string;
  amount: bigint;
  description: string;
  createdAt?: Date;
  categoryId: string;
}

export interface ISpendingWithCategoryName
  extends Omit<ISpending, "categoryId"> {
  categoryName: string;
}

export interface ITotalSpendingAmountByCategoryName {
  categoryName: string;
  amount: number;
}

const getAll = async (): Promise<ISpending[]> => {
  const result = await sql<ISpending[]>`
    SELECT * FROM spending
  `;

  return result;
};

const getOneById = async (id: string): Promise<ISpending> => {
  const result = await sql<ISpending[]>`
    SELECT * FROM spending WHERE id=${id}
  `;

  return result[0];
};

const createOneSpending = async (spending: ISpending): Promise<ISpending> => {
  const insertResult = await sql<ISpending[]>`
    INSERT INTO spending 
      (amount, description, category_id) 
    VALUES (${spending.amount}, ${spending.description}, ${spending.categoryId}) 
    RETURNING *
  `;

  if (insertResult.count === 0) {
    throw new Error(
      `Failed to insert spending | ${JSON.stringify(spending, null, 2)}`,
    );
  }

  return insertResult[0];
};

const getSpendingSummaryByDatetimeRangeGroupByCategoryName = async (
  fromInclusive: dayjs.Dayjs,
  toExclusive: dayjs.Dayjs,
): Promise<
  ITotalSpendingAmountByCategoryName[]
> => {
  const spendings = await sql<ITotalSpendingAmountByCategoryName[]>`
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
  `;

  return spendings;
};

const getAllSpendingsByDatetimeRangeSortByCategory = async (
  fromInclusive: dayjs.Dayjs,
  toExclusive: dayjs.Dayjs,
): Promise<
  ISpendingWithCategoryName[]
> => {
  const spendings = await sql<ISpendingWithCategoryName[]>`
    select
      spending.id, spending.amount, spending.description, category.name, spending.created_at
    from spending
    join
      category on category.id = spending.category_id
    where
      spending.created_at >= ${
    fromInclusive.format("YYYY-MM-DD HH:mm:ss")
  }::timestamp AT TIME ZONE 'Asia/Jakarta'
    and
      spending.created_at < ${
    toExclusive.format("YYYY-MM-DD HH:mm:ss")
  }::timestamp AT TIME ZONE 'Asia/Jakarta'
  order by
    category.priority asc
  `;

  return spendings;
};

/***********************
 * Convenience Queries *
 ***********************/
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
    dayjs().add(1, "month").startOf("day"),
  );
};

const getAllSpendingsThisMonth = async (): Promise<
  ISpendingWithCategoryName[]
> => {
  return await getAllSpendingsByDatetimeRangeSortByCategory(
    dayjs().startOf("month").startOf("day"),
    dayjs().add(1, "month").startOf("day"),
  );
};

const spendingRepository = {
  createOneSpending,
  getAll,
  getOneById,
  getTodaySpendingSummary,
  getThisMonthSpendingSummary,
  getAllSpendingsThisMonth,
};

export default spendingRepository;
