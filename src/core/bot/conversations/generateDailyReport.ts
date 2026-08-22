import { MyContext, MyConversation } from "~/src/core/bot/client.ts";
import spendingRepository from "~/src/spending/repository.ts";
import messageFormatter from "~/src/core/bot/messageFormatter.ts";

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
