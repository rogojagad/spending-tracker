import { type Context, Hono } from "@hono/hono";
import { logger } from "@hono/middleware";
import TelegramBot from "~/src/bot/client.ts";
import cron from "~/src/cron.ts";

/** HTTP Server */
const app = new Hono();

/** Telegram Bot  */
const bot = new TelegramBot();

bot.start();

/** Middleware */
app.use(logger());

/** Endpoints */
app.get("/ping", (c: Context) => {
  return c.json({ data: "pong" });
});

cron.register(bot);

Deno.serve({ port: 8080 }, app.fetch);
