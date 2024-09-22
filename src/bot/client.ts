import { Bot } from "grammy";
import TelegramBotHandler from "~/src/bot/handler.ts";

export default class TelegramBot {
  private bot: Bot;
  private handler: TelegramBotHandler;

  constructor(handler: TelegramBotHandler) {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

    if (!botToken?.length) throw new Error(`Bot token undefined`);

    this.bot = new Bot(botToken);
    this.handler = handler;
    this.handler.registerHandler(this.bot);
  }

  start(): void {
    this.bot.start();
  }

  getClientInstance(): Bot {
    return this.bot;
  }
}
