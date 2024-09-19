import sql from "~/src/postgre.ts";
import runQuery from "~/src/postgre.ts";

export interface ISpending {
  id?: string;
  amount: number;
  description: string;
  createdAt?: Date;
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
      (amount, description) 
    VALUES (${spending.amount}, ${spending.description}) 
    RETURNING *
    
  `;

  if (insertResult.count === 0) {
    throw new Error(
      `Failed to insert spending | ${JSON.stringify(spending, null, 2)}`,
    );
  }

  return insertResult[0];
};

const spendingRepository = { createOneSpending, getAll, getOneById };

export default spendingRepository;
