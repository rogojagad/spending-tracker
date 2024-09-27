import sql from "~/src/postgre.ts";
import dayjs from "dayjs";

export interface ISpending {
  id?: string;
  amount: number;
  description: string;
  createdAt?: Date;
  categoryId: string;
}

export interface ITotalSpendingAmountPerCategoryId {
  categoryId: string;
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

const getAllSpendingToday = async (): Promise<
  ITotalSpendingAmountPerCategoryId[]
> => {
  const today = dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss");
  const tomorrow = dayjs().startOf("day").add(1, "day").format(
    "YYYY-MM-DD HH:mm:ss",
  );

  const spendings = await sql<ITotalSpendingAmountPerCategoryId[]>`
    SELECT category_id, sum(amount) as amount
    FROM spending
    WHERE created_at >= ${today}::timestamp AT TIME ZONE 'Asia/Jakarta'
    AND created_at < ${tomorrow}::timestamp AT TIME ZONE 'Asia/Jakarta'
    GROUP BY category_id
  `;

  return spendings;
};

const spendingRepository = {
  createOneSpending,
  getAll,
  getOneById,
  getAllSpendingToday,
};

export default spendingRepository;
