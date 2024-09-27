import { Bot } from "grammy";
import TelegramBotHandler from "~/src/bot/handler.ts";

export default class TelegramBot {
  private bot: Bot;
  private handler: TelegramBotHandler;
  private recipientId: string;

  constructor(handler: TelegramBotHandler) {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

    if (!botToken?.length) throw new Error(`Bot token undefined`);

    this.bot = new Bot(botToken);
    this.handler = handler;
    this.handler.registerHandler(this.bot);
    this.recipientId = this.getRecipientId();
  }

  getRecipientId(): string {
    const recipientId = Deno.env.get("TELEGRAM_RECIPIENT_ID");

    if (!recipientId?.length) throw new Error(`Telegram recipient ID unset`);

    return recipientId;
  }

  start(): void {
    this.bot.start();
  }

  getClientInstance(): Bot {
    return this.bot;
  }

  async sendMessageToRecipient(message: string): Promise<void> {
    const messageInstance = await this.bot.api.sendMessage(
      this.recipientId,
      message,
    );

    console.info(
      `Success sending message | Message ID: ${messageInstance.message_id} | Text: ${message}`,
    );
  }
}
