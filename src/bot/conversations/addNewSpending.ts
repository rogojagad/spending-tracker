import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation } from "~/src/bot/client.ts";
import categoryRepository, { ICategory } from "~/src/category/repository.ts";
import spendingRepository from "~/src/spending/repository.ts";

import "../../types/extensions/number.ts";
import sourceCategory, { ISource } from "~/src/source/repository.ts";
import limitService from "../../limit/service.ts";
import messageFormatter from "../messageFormatter.ts";

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
  const sources = await sourceCategory.getAllActive();

  const categoryId = await getSpendingCategory(categories, ctx, conversation);
  const sourceId = await getSpendingSource(sources, ctx, conversation);

  const spending = await spendingRepository.createOneSpending({
    amount,
    description,
    categoryId,
    sourceId,
  });

  const category = categories.find(({ id }) => id === categoryId);
  const source = sources.find(({ id }) => id === sourceId);

  await ctx.reply(
    `Done adding ${amount.toIDRString()} for ${spending.description} on ${
      category!.name
    } from ${source!.name}`,
  );

  const limitsNeedAlert = await limitService.getLimitsExceededBySpending(
    spending,
  );

  if (!limitsNeedAlert.length) return;

  await ctx.reply(messageFormatter.formatLimitAlert(limitsNeedAlert));

  return;
}

async function getSpendingCategory(
  categories: ICategory[],
  ctx: MyContext,
  conversation: MyConversation,
): Promise<string> {
  const inlineKeyboard = new InlineKeyboard();
  categories.forEach((category) =>
    inlineKeyboard.text(category.name, category.id).row()
  );

  await ctx.reply("Please select spending category", {
    reply_markup: inlineKeyboard,
  });

  const categoryCallbackQuery = await conversation.waitFor(
    "callback_query:data",
  );
  await categoryCallbackQuery.answerCallbackQuery();
  return categoryCallbackQuery.callbackQuery.data;
}

async function getSpendingSource(
  sources: ISource[],
  ctx: MyContext,
  conversation: MyConversation,
): Promise<string> {
  const inlineKeyboard = new InlineKeyboard();

  sources.forEach((source) => {
    inlineKeyboard.text(source.name, source.id).row();
  });

  await ctx.reply("Please select spending source", {
    reply_markup: inlineKeyboard,
  });
  const sourceCallbackQuery = await conversation.waitFor(
    "callback_query:data",
  );
  await sourceCallbackQuery.answerCallbackQuery();
  return sourceCallbackQuery.callbackQuery.data;
}
