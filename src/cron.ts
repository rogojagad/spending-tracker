import messageFormatter from "~/src/bot/messageFormatter.ts";
import TelegramBot from "~/src/bot/client.ts";
import dayjs from "dayjs";
import spendingRepository from "~/src/spending/repository.ts";

const register = (bot: TelegramBot): void => {
  /** 23:59 PM JKT daily */
  Deno.cron("Daily Report", "59 16 * * *", async () => {
    const isEom = dayjs().daysInMonth() === dayjs().get("date");

    const todaySpendingSummary = await spendingRepository
      .getTodaySpendingSummary();

    await bot.sendMessageToRecipient(
      messageFormatter.formatDailyReport(todaySpendingSummary),
    );

    if (isEom) {
      const spendingSummaryThisMonth = await spendingRepository
        .getThisMonthSpendingSummary();

      await bot.sendMessageToRecipient(
        messageFormatter.formatMonthlyReport(spendingSummaryThisMonth),
      );
    }
  });
};

export default { register };
