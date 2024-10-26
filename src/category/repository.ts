import db from "~/src/postgre.ts";

export const CATEGORY_TABLE = "category";

export interface ICategory {
  id?: string;
  name: string;
  priority: number;
}

const getAll = async (): Promise<ICategory[]> => {
  const result = await db.selectFrom(CATEGORY_TABLE).selectAll().execute();

  return result;
};

const getOneById = async (id: string): Promise<ICategory> => {
  const result = await db.selectFrom(CATEGORY_TABLE).where("id", "=", id)
    .selectAll()
    .execute();

  return result[0];
};

const categoryRepository = { getAll, getOneById };

export default categoryRepository;
