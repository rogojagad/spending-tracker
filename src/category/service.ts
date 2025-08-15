import categoryRepository, { ICategory } from "~/src/category/repository.ts";

const getAll = async (): Promise<ICategory[]> => {
  return await categoryRepository.getAll();
};

const categoryService = { getAll };

export default categoryService;
