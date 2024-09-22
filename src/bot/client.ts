import { Bot } from "grammy";
import TelegramBotHandler from "~/src/bot/handler.ts";

export enum BotMode {
  POLLING = "POLLING",
  WEBHOOK = "WEBHOOK",
}

export default class TelegramBot {
  private bot: Bot;
  private handler: TelegramBotHandler;

  private CONST_WEBHOOK_URL_TEMPLATE =
    "https://api.telegram.org/bot<token>/setWebhook?url=<url>";

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

  async runInWebhookMode(): Promise<void> {
    const appUrl = Deno.env.get("APP_URL");
    if (!appUrl?.length) throw new Error(`App URL env undefined`);

    const url = this.CONST_WEBHOOK_URL_TEMPLATE.replace(
      "<token>",
      Deno.env.get("TELEGRAM_BOT_TOKEN")!,
    ).replace("<url>", `${appUrl}`);

    console.log(`Callback URL: ${url}`);

    await this.bot.api.setWebhook(url);
  }
}
