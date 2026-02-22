import db from "~/src/postgre.ts";

export const CATEGORY_TABLE = "category";

export interface ICategory {
  id?: string;
  name: string;
  priority: number;
  isActive: boolean;
}

const getAll = async (): Promise<ICategory[]> => {
  const results = await db.selectFrom(CATEGORY_TABLE).selectAll().orderBy(
    "priority asc",
  ).execute();

  return results;
};

const getOneById = async (id: string): Promise<ICategory> => {
  const result = await db.selectFrom(CATEGORY_TABLE).where("id", "=", id)
    .selectAll()
    .executeTakeFirstOrThrow();

  return result;
};

const getAllActive = (): Promise<ICategory[]> => {
  return db.selectFrom(CATEGORY_TABLE).selectAll().where("isActive", "=", true)
    .orderBy(
      "priority asc",
    ).execute();
};

const categoryRepository = {
  getAll,
  getAllActive,
  getOneById,
};

export default categoryRepository;
