import spendingRepository from "~/src/spending/repository.ts";
import categoryRepository from "~/src/category/repository.ts";
import messageFormatter from "~/src/bot/messageFormatter.ts";
import TelegramBot from "~/src/bot/client.ts";

const register = (bot: TelegramBot): void => {
  Deno.cron("Daily Report", { hour: { every: 22 } }, async () => {
    const spendings = await spendingRepository.getAllSpendingToday();
    const categories = await categoryRepository.getAll();

    const map = new Map<string, number>();

    for (const spending of spendings) {
      const category = categories.find((category) => {
        return category?.id === spending.categoryId;
      });

      const categoryName = category!.name;

      map.set(categoryName, spending.amount);
    }

    bot.sendMessageToRecipient(messageFormatter.formatDailyReport(map));
  });
};

export default { register };
