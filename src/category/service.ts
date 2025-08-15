import categoryRepository, { ICategory } from "~/src/category/repository.ts";
import { timed } from "../utils/timed.ts";

const getAll = async (): Promise<ICategory[]> => {
  return await categoryRepository.getAll();
};

const categoryService = timed("categoryService", { getAll });

export default categoryService;
