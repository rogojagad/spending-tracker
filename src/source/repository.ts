import db from "~/src/postgre.ts";

export const SOURCE_TABLE = "source";

export interface ISource {
  id: string;
  name: string;
}

const getAll = async (): Promise<ISource[]> => {
  const results = await db.selectFrom(SOURCE_TABLE).selectAll().execute();
  return results;
};

const getOneById = async (id: string): Promise<ISource> => {
  const result = await db.selectFrom(SOURCE_TABLE).where("id", "=", id)
    .selectAll()
    .executeTakeFirstOrThrow();

  return result;
};

const sourceCategory = { getAll, getOneById };

export default sourceCategory;
