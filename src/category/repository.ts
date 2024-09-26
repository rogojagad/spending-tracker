import sql from "~/src/postgre.ts";

export interface ICategory {
  id?: string;
  name: string;
  priority: number;
}

const getAll = async (): Promise<ICategory[]> => {
  const result = await sql<ICategory[]>`
    SELECT * FROM category ORDER BY priority ASC
  `;

  return result;
};

const getOneById = async (id: string): Promise<ICategory> => {
  const result = await sql<ICategory[]>`
    SELECT * FROM category WHERE id=${id}
  `;

  return result[0];
};

const categoryRepository = { getAll, getOneById };

export default categoryRepository;
