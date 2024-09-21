import { Bot, InlineKeyboard } from "grammy";
import categoryRepository from "~/src/category/repository.ts";
import spendingRepository from "~/src/spending/repository.ts";

export default class TelegramBotHandler {
  private amount: number;
  private description: string;
  private categoryId: string;

  private CONST_NUM_READY_FLAG = -1;
  private CONST_STRING_READY_FLAG = "*";

  constructor() {
    this.amount = this.CONST_NUM_READY_FLAG;
    this.description = this.CONST_STRING_READY_FLAG;
    this.categoryId = this.CONST_STRING_READY_FLAG;
  }

  private isReady(): boolean {
    return this.amount === this.CONST_NUM_READY_FLAG &&
      this.description === this.CONST_STRING_READY_FLAG &&
      this.categoryId === this.CONST_STRING_READY_FLAG;
  }

  private makeReady(): boolean {
    this.amount = this.CONST_NUM_READY_FLAG;
    this.description = this.CONST_STRING_READY_FLAG;
    this.categoryId = this.CONST_STRING_READY_FLAG;

    return true;
  }

  registerHandler(bot: Bot) {
    bot.hears(/^(\d+)\s+(.+)$/, async (ctx) => {
      if (!this.isReady()) await ctx.reply("Bot is unready, please wait");

      const categories = await categoryRepository.getAll();
      const buttonRow = categories.map((category) =>
        InlineKeyboard.text(category.name, category.id)
      );

      this.amount = Number(ctx.match[1]);
      this.description = ctx.match[2];

      await ctx.reply("Please select spending category", {
        reply_markup: InlineKeyboard.from([buttonRow]),
      });
    });

    bot.on("callback_query:data", async (ctx) => {
      this.categoryId = ctx.callbackQuery.data;
      console.log(this.categoryId);

      const spending = await spendingRepository.createOneSpending({
        amount: this.amount,
        description: this.description,
        categoryId: this.categoryId,
      });

      console.log(spending);

      this.makeReady();

      await ctx.answerCallbackQuery();
      await ctx.reply("Done");
    });
  }
}