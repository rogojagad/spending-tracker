import db from "~/src/postgre.ts";
import { timed } from "../utils/timed.ts";

export const CATEGORY_TABLE = "category";

export interface ICategory {
  id?: string;
  name: string;
  priority: number;
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

const categoryRepository = timed("categoryRepository", {
  getAll,
  getOneById,
});

export default categoryRepository;
