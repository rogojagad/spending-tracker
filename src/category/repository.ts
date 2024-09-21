import sql from "~/src/postgre.ts";

export interface ICategory {
  id: string;
  name: string;
}

const getAll = async (): Promise<ICategory[]> => {
  const result = await sql<ICategory[]>`
    SELECT * FROM category
  `;

  return result;
};

const categoryRepository = { getAll };

export default categoryRepository;
