import spendingRepository from "~/src/spending/repository.ts";
import categoryRepository from "~/src/category/repository.ts";
import messageFormatter from "~/src/bot/messageFormatter.ts";
import TelegramBot from "~/src/bot/client.ts";
import dayjs from "dayjs";

const register = (bot: TelegramBot): void => {
  /** 23:59 PM JKT daily */
  Deno.cron("Daily Report", "59 16 * * *", async () => {
    const isEom = dayjs().daysInMonth() === dayjs().get("date");

    if (isEom) {
      // TODO: Monthly report
    } else {
      const spendings = await spendingRepository.getAllSpendingToday();
      const categories = await categoryRepository.getAll();
      const map = new Map<string, bigint>();

      for (const spending of spendings) {
        const category = categories.find((category) => {
          return category?.id === spending.categoryId;
        });

        const categoryName = category!.name;

        map.set(categoryName, BigInt(spending.amount));
      }

      await bot.sendMessageToRecipient(messageFormatter.formatDailyReport(map));
    }
  });
};

export default { register };
