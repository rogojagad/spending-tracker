import spendingRepository from "~/src/spending/repository.ts";
import categoryRepository from "~/src/category/repository.ts";
import messageFormatter from "~/src/bot/messageFormatter.ts";
import TelegramBot from "~/src/bot/client.ts";

const register = (bot: TelegramBot): void => {
  /** 22:15 PM JKT daily */
  Deno.cron("Daily Report", "59 16 * * *", async () => {
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

    bot.sendMessageToRecipient(messageFormatter.formatDailyReport(map));
  });
};

export default { register };
