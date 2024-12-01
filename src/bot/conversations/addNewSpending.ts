import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation } from "~/src/bot/client.ts";
import categoryRepository from "~/src/category/repository.ts";
import spendingRepository from "~/src/spending/repository.ts";

import "../../types/extensions/number.ts";

/**
 * Triggered when user send `{amount} {description}` e.g. `1000000 electricity bill`
 *
 * `1000000` will be amount
 * `electricity bill` will be description
 *
 * This conversation will
 * 1. receive and parse amount and description from sent message
 * 2. reply with list of available categories in the form of Inline Keyboard
 * 3. wait for callback query from selected options
 * 4. store the spending information to DB
 * 5. response with acknowledgement to user
 *
 * @param conversation
 * @param ctx
 * @returns unknown
 */
export async function addNewSpending(
  conversation: MyConversation,
  ctx: MyContext,
): Promise<unknown> {
  if (!ctx.match) throw new Error("Unexpected error");

  const amount = Number(ctx.match[1]);
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
    amount,
    description,
    categoryId,
  });

  const category = await categoryRepository.getOneById(spending.categoryId);

  await callbackQuery.answerCallbackQuery();
  await callbackQuery.reply(
    `Done adding ${amount.toIDRString()} for ${spending.description} on ${category.name}`,
  );

  return;
}
