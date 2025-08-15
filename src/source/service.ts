import sourceCategory, { ISource } from "~/src/source/repository.ts";
import { timed } from "../utils/timed.ts";

const getAll = async (): Promise<ISource[]> => {
  return await sourceCategory.getAll();
};

const sourceService = timed("sourceService", { getAll });

export default sourceService;
