import { ISpendingWithCategoryNameAndSourceName } from "../spending/repository.ts";
import spreadsheetRepository from "./repository.ts";

const recordSpendingsOnSpreadsheet = async <T>(
  title: string,
  data: ISpendingWithCategoryNameAndSourceName[],
): Promise<void> => {
  await spreadsheetRepository.createNewSheet(title);
  await spreadsheetRepository.recordSpendings(
    title,
    data,
  );
};

const spreadsheetService = { recordSpendingsOnSpreadsheet };

export default spreadsheetService;
