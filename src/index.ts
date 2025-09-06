import { cors, logger } from "@hono/middleware";
import { generateToken, validatePassword } from "~/src/middleware.ts";
import { type Context, Hono } from "@hono/hono";
import categoryController from "./category/controller.ts";
import cron from "~/src/cron.ts";
import limitController from "./limit/controller.ts";
import sourceController from "./source/controller.ts";
import spendingController from "./spending/controller.ts";
import configurationController from "./configuration/controller.ts";
import TelegramBot from "~/src/bot/client.ts";
import { webhookCallback } from "grammy";

/** HTTP Server */
const app = new Hono();

/** Middleware */
app.use(logger());
app.use(cors());

/** Endpoints */
app.post("/auth", async (c: Context) => {
  const body = await c.req.json();
  const { password } = body;

  if (!password || !validatePassword(password)) {
    return c.json({ error: "Invalid password" }, 401);
  }

  const token = await generateToken();
  return c.json({ token });
});

app.get("/ping", (c: Context) => {
  return c.json({ data: "pong" });
});

app.route("/spendings", spendingController);
app.route("/categories", categoryController);
app.route("/sources", sourceController);
app.route("/limits", limitController);
app.route("/configs", configurationController);

/**
 * Telegram Bot
 *
 * ALWAYS put Telegram bot setup as the last step. It is related to the order-matters of Hono middleware setup.
 * The middleware function will be effective in order. So, first middleware being set up always the first one to handle the request.
 *
 * Grammy webhook mode use middleware mode. Thus, if we put this middleware BEFORE all the generic middleware, it will handle the request and throws if the request is not a Telegram webhook request.
 *
 * Causing regular HTTP request from API endpoints to always be rejected.(smh!)
 */
const bot = new TelegramBot();

const shouldUseWebhookMode = Deno.env.get("SHOULD_USE_WEBHOOK");
console.info(`Should use webhook mode: ${shouldUseWebhookMode}`);
if (shouldUseWebhookMode) {
  app.use(webhookCallback(bot.getClientInstance(), "hono"));
} else bot.start();

/** Cron */
cron.register(bot);

/** App Serve */
Deno.serve({ port: 8080 }, app.fetch);
