import { Bot, Context, session } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
} from "grammy/conversations";

export type MyContext = Context & ConversationFlavor;
export type MyConversation = Conversation<Context>;
type BotClient = Bot<MyContext>;

/**
 * A wrapper to the Telegram bot client.
 *
 * This class is responsible for
 *
 * - initializing the instance
 * - register all required middlewares and event listeners
 * - sending message from app to user
 */
class TelegramBot {
  private bot: BotClient;
  private recipientId: string;

  constructor() {
    // init instance
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!botToken?.length) throw new Error(`Bot token undefined`);

    const botClient = new Bot<MyContext>(botToken);

    // register middlewares
    botClient.use(session({ initial: () => ({}) }));
    botClient.use(conversations());

    // persists instance and other relevant values
    // this should be final step, all event handler registration should be done before this
    this.bot = botClient;
    this.recipientId = this.getRecipientId();
  }

  private getRecipientId(): string {
    const recipientId = Deno.env.get("TELEGRAM_RECIPIENT_ID");

    if (!recipientId?.length) throw new Error(`Telegram recipient ID unset`);

    return recipientId;
  }

  start(): void {
    this.bot.start();
  }

  getClientInstance(): BotClient {
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

export default new TelegramBot();
