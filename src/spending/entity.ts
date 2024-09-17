import runQuery from "~/src/postgre.ts";

export interface ISpending {
    id?: string;
    amount: number;
    description: string;
    createdAt?: Date;
}

const getAll = async (): Promise<ISpending[][]> => {
    const result = await runQuery<ISpending[]>(
        "SELECT * FROM spending",
    );

    return result.rows;
};

const getOneById = async (id: string): Promise<ISpending> => {
    const result = await runQuery<ISpending>(
        "SELECT * FROM spending WHERE id='$id'",
        { id },
    );

    return result.rows[1];
};

const createOneSpending = async (spending: ISpending): Promise<ISpending> => {
    const insertResult = await runQuery<ISpending>(
        "INSERT INTO spending (amount, description) values ( $amount, $description) RETURNING *",
        { amount: spending.amount, description: spending.description },
    );

    if (insertResult.rowCount === 0) {
        throw new Error(
            `Failed to insert spending | ${JSON.stringify(spending, null, 2)}`,
        );
    }

    return insertResult.rows[0];
};

const spendingRepository = { createOneSpending, getAll, getOneById };

export default spendingRepository;
