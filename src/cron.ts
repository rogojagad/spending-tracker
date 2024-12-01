import messageFormatter from "~/src/bot/messageFormatter.ts";
import TelegramBot from "~/src/bot/client.ts";
import dayjs from "dayjs";
import spendingRepository from "~/src/spending/repository.ts";
import spreadsheetRepository from "~/src/spreadsheet/repository.ts";

const register = (bot: TelegramBot): void => {
  /** 23:59 PM JKT daily */
  Deno.cron("Daily Report", "59 16 * * *", async () => {
    const todaySpendingSummary = await spendingRepository
      .getTodaySpendingSummary();

    await bot.sendMessageToRecipient(
      messageFormatter.formatDailyReport(todaySpendingSummary),
    );

    const isEom = dayjs().daysInMonth() === dayjs().get("date");
    if (isEom) {
      const spendingSummaryThisMonth = await spendingRepository
        .getThisMonthSpendingSummary();

      await bot.sendMessageToRecipient(
        messageFormatter.formatMonthlyReport(spendingSummaryThisMonth),
      );

      const thisMonthSpendings = await spendingRepository
        .getAllSpendingsThisMonth();

      const sheetTitle = dayjs().format("MMMM-YYYY");
      await spreadsheetRepository.createNewSheet(sheetTitle);
      await spreadsheetRepository.recordSpendings(
        sheetTitle,
        thisMonthSpendings,
      );
    }
  });
};

export default { register };
