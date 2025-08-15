import sourceCategory, { ISource } from "~/src/source/repository.ts";

const getAll = async (): Promise<ISource[]> => {
  return await sourceCategory.getAll();
};

const sourceService = { getAll };

export default sourceService;
