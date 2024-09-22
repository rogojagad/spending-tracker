import { Context, Hono } from "@hono/hono";
import { logger } from "@hono/middleware";
import spendingRepository from "~/src/spending/repository.ts";
import {
  CreateSpendingRequestPayload,
  createSpendingRequestSchema,
} from "~/src/spending/schema.ts";
import { bodyValidator } from "~/src/middleware/bodyValidator.ts";
import TelegramBot, { BotMode } from "~/src/bot/client.ts";
import TelegramBotHandler from "~/src/bot/handler.ts";
import { webhookCallback } from "grammy";

/** HTTP Server */
const app = new Hono();

/** Telegram Bot  */
const bot = new TelegramBot(new TelegramBotHandler());

if (Deno.env.get("TELEGRAM_BOT_MODE") !== BotMode.WEBHOOK) {
  bot.start();
} else {
  webhookCallback(bot.getClientInstance(), "hono");
  await bot.runInWebhookMode();
}

/** Middleware */
app.use(logger());

/** Endpoints */
app.get("/ping", (c: Context) => {
  return c.json({ data: "pong" });
});

app.get("/spendings", async (c: Context) => {
  const spendings = await spendingRepository.getAll();

  return c.json({ data: spendings, meta: { count: spendings.length } });
});

app.get("/spendings/:id", async (c: Context) => {
  const { id } = c.req.param();
  const spending = await spendingRepository.getOneById(id);

  return c.json({ data: spending });
});

app.post(
  "/spendings",
  bodyValidator(createSpendingRequestSchema),
  async (c: Context) => {
    const requestBody = await c.req.json<CreateSpendingRequestPayload>();
    const spending = await spendingRepository.createOneSpending(requestBody);

    return c.json({ data: spending });
  },
);

app.post(`/bot/spendings`, async (c: Context) => {
  const requestBody = await c.req.json();
  console.log(requestBody);

  return c.status(200);
});

Deno.serve({ port: 8080 }, app.fetch);
