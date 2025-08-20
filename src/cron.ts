import messageFormatter from "~/src/bot/messageFormatter.ts";
import TelegramBot from "~/src/bot/client.ts";
import dayjs from "dayjs";
import spendingRepository from "~/src/spending/repository.ts";
import spreadsheetService from "./spreadsheet/service.ts";
import limitService from "./limit/service.ts";
import limitSnapshotRepository from "./limitSnapshot/repository.ts";

const register = (bot: TelegramBot): void => {
  /** 23:59 PM JKT daily */
  Deno.cron("Daily Report", "59 16 * * *", async () => {
    const todaySpendingSummary = await spendingRepository
      .getTodaySpendingSummary();

    await bot.sendMessageToRecipient(
      messageFormatter.formatDailyReport(todaySpendingSummary),
    );

    const creditCardSpendingAmountPerCategory = await spendingRepository
      .getTodaySpendingAmountToSettlePerSourceAndCategory();

    if (creditCardSpendingAmountPerCategory.length) {
      await bot.sendMessageToRecipient(
        messageFormatter.formatDailySettlementReport(
          creditCardSpendingAmountPerCategory,
        ),
      );
    }

    const isEom = dayjs().daysInMonth() === dayjs().get("date");
    if (isEom) {
      await Promise.all([
        await sendMonthlySummary(bot),
        await snapshotSpendingsToSpreadsheet(),
        await snapshotLimitUsage(),
      ]); // can be done in concurrency
    }
  });
};

const sendMonthlySummary = async (bot: TelegramBot): Promise<void> => {
  const spendingSummaryThisMonth = await spendingRepository
    .getThisMonthSpendingSummary();
  await bot.sendMessageToRecipient(
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
    limitSnapshotRepository.createOne({
      name: limitUsage.name,
      value: limitUsage.value,
      categoryId: limitUsage.categoryId,
      sourceId: limitUsage.sourceId,
      descriptionKeywords: limitUsage.descriptionKeywords,
      applicationPeriod: limitUsage.applicationPeriod,
      usedValue: limitUsage.usedValue,
      usedPercentage: limitUsage.usedPercentage,
    });
  }));
};

export default { register };
