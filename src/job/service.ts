import spendingRepository from "../spending/repository.ts";
import botClient from "../bot/client.ts";
import messageFormatter from "../bot/messageFormatter.ts";
import dayjs from "dayjs";
import spreadsheetService from "../spreadsheet/service.ts";
import limitService from "../limit/service.ts";
import limitSnapshotRepository, {
  ILimitSnapshot,
} from "../limitSnapshot/repository.ts";

const sendDailySummary = async (): Promise<void> => {
  const todaySpendingSummary = await spendingRepository
    .getTodaySpendingSummary();

  await botClient.sendMessageToRecipient(
    messageFormatter.formatDailyReport(todaySpendingSummary),
  );
};

const sendDailySettlementReminderIfAny = async (): Promise<void> => {
  const creditCardSpendingAmountPerCategory = await spendingRepository
    .getTodaySpendingAmountToSettlePerSourceAndCategory();

  if (creditCardSpendingAmountPerCategory.length) {
    await botClient.sendMessageToRecipient(
      messageFormatter.formatDailySettlementReport(
        creditCardSpendingAmountPerCategory,
      ),
    );
  }
};

const doEndOfMonthReconciliationIfApplied = async (): Promise<void> => {
  const isEom = dayjs().daysInMonth() === dayjs().get("date");

  if (!isEom) return;

  await Promise.all([
    sendMonthlySummary(),
    snapshotSpendingsToSpreadsheet(),
    snapshotLimitUsage(),
  ]); // can be done concurrently
};

const sendMonthlySummary = async (): Promise<void> => {
  const spendingSummaryThisMonth = await spendingRepository
    .getThisMonthSpendingSummary();
  await botClient.sendMessageToRecipient(
    messageFormatter.formatMonthlyReport(spendingSummaryThisMonth),
  );
};

const snapshotSpendingsToSpreadsheet = async (): Promise<void> => {
  const thisMonthSpendings = await spendingRepository
    .getAllSpendingsThisMonth();
  const sheetTitle = dayjs().format("MMMM-YYYY");
  await spreadsheetService.recordSpendingsOnSpreadsheet(
    sheetTitle,
    thisMonthSpendings,
  );
};

const snapshotLimitUsage = async (): Promise<void> => {
  const limitUsage = await limitService.getAndCalculateAllLimitUsage();
  await Promise.all(limitUsage.map((limitUsage) => {
    // Strip extra fields (categoryName, sourceName) that aren't in ILimitSnapshot
    const {
      categoryName: _categoryName,
      sourceName: _sourceName,
      ...limitSnapshot
    } = limitUsage;

    return limitSnapshotRepository.createOne(limitSnapshot).then(
      (limitSnapshot: ILimitSnapshot) => {
        console.log(`Limit ${limitSnapshot.name} snapshotted...`);
      },
    );
  }));
};

const jobService = {
  sendDailySummary,
  sendDailySettlementReminderIfAny,
  doEndOfMonthReconciliationIfApplied,
  snapshotLimitUsage,
};

export default jobService;
