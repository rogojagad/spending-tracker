import serviceAccountAuth from "~/src/spreadsheet/auth.ts";
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from "spreadsheet";
import { ISpendingWithCategoryName } from "~/src/spending/repository.ts";

const sheetId = Deno.env.get("MONTHLY_REPORT_SHEET_ID");

if (!sheetId?.length) throw new Error(`Monthly Report Sheet ID undefined`);

const spreadsheet = new GoogleSpreadsheet(sheetId, serviceAccountAuth);

const createNewSheet = async (
  title: string,
): Promise<GoogleSpreadsheetWorksheet> => {
  return await spreadsheet.addSheet({
    title,
  });
};

const recordSpendings = async (
  title: string,
  spendings: ISpendingWithCategoryName[],
): Promise<void> => {
  await spreadsheet.loadInfo();

  const worksheet = spreadsheet.sheetsByTitle[title];

  await worksheet.addRows(spendings.map((spending) => {
    return {
      "Description": spending.description,
      "Amount": Number(spending.amount),
      "Category": spending.categoryName,
      "Spend At": spending.createdAt!,
    };
  }));
};

const spreadsheetRepository = { createNewSheet, recordSpendings };

export default spreadsheetRepository;
