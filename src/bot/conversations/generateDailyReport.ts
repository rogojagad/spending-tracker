import { MyContext, MyConversation } from "~/src/bot/client.ts";
import spendingRepository from "~/src/spending/repository.ts";
import messageFormatter from "~/src/bot/messageFormatter.ts";

export async function generateDailyReport(
  _: MyConversation,
  ctx: MyContext,
): Promise<unknown> {
  const todaySpendingSummary = await spendingRepository
    .getTodaySpendingSummary();

  await ctx.reply(
    messageFormatter.formatDailyReport(todaySpendingSummary),
  );

  return;
}
