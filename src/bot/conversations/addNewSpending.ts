import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation } from "~/src/bot/client.ts";
import categoryRepository from "~/src/category/repository.ts";
import spendingRepository from "~/src/spending/repository.ts";

export async function addNewSpending(
  conversation: MyConversation,
  ctx: MyContext,
): Promise<unknown> {
  if (!ctx.match) throw new Error("Unexpected error");

  const amount = BigInt(ctx.match[1]);
  const description = ctx.match[2];

  const categories = await categoryRepository.getAll();
  const buttonRow = categories.map((category) =>
    InlineKeyboard.text(category.name, category.id)
  );

  await ctx.reply("Please select spending category", {
    reply_markup: InlineKeyboard.from([buttonRow]),
  });

  const callbackQuery = await conversation.waitFor("callback_query:data");
  const categoryId = callbackQuery.callbackQuery.data;

  const spending = await spendingRepository.createOneSpending({
    amount: amount,
    description: description,
    categoryId: categoryId,
  });

  const category = await categoryRepository.getOneById(spending.categoryId);

  await callbackQuery.answerCallbackQuery();
  await callbackQuery.reply(
    `Done adding IDR ${spending.amount} for ${spending.description} on ${category.name}`,
  );

  return;
}
