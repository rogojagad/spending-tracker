import serviceAccountAuth from "~/src/spreadsheet/auth.ts";
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from "spreadsheet";
import { ISpendingWithCategoryName } from "~/src/spending/repository.ts";
import spreadsheetConstants from "~/src/spreadsheet/constants.ts";
import { get, set } from "radash";

const sheetId = Deno.env.get("MONTHLY_REPORT_SHEET_ID");

if (!sheetId?.length) throw new Error(`Monthly Report Sheet ID undefined`);

const spreadsheet = new GoogleSpreadsheet(sheetId, serviceAccountAuth);

const getExistingWorksheetByTitle = async (
  title: string,
): Promise<GoogleSpreadsheetWorksheet | undefined> => {
  await spreadsheet.loadInfo();

  return spreadsheet.sheetsByTitle[title];
};

const createNewSheet = async (
  title: string,
): Promise<GoogleSpreadsheetWorksheet> => {
  const worksheet = await getExistingWorksheetByTitle(title) ||
    await spreadsheet.addSheet({
      title,
    });

  await worksheet.setHeaderRow(
    Array.from(
      spreadsheetConstants.DATA_FIELD_MAP_TO_REPORT_HEADER_MAP.values(),
    ),
  );

  return worksheet;
};

const recordSpendings = async (
  title: string,
  spendings: ISpendingWithCategoryName[],
): Promise<void> => {
  const worksheet = await getExistingWorksheetByTitle(title);

  if (!worksheet) throw new Error(`Worksheet ${title} not yet created`);

  await worksheet.addRows(spendings.map((spending) => {
    const { DATA_FIELD_MAP_TO_REPORT_HEADER_MAP } = spreadsheetConstants;

    const keys = Object.keys(spending);
    let mapped = {};

    keys.forEach((key) => {
      const headerName = DATA_FIELD_MAP_TO_REPORT_HEADER_MAP.get(key);

      if (!headerName?.length) throw Error(`Data field ${key} unmapped`);

      mapped = set(mapped, headerName, get(spending, key));
    });

    return mapped;
  }));
};

const spreadsheetRepository = { createNewSheet, recordSpendings };

export default spreadsheetRepository;
