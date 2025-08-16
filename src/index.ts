import { cors, logger } from "@hono/middleware";
import { generateToken, validatePassword } from "~/src/middleware.ts";
import { type Context, Hono } from "@hono/hono";
import categoryController from "./category/controller.ts";
import cron from "~/src/cron.ts";
import limitController from "./limit/controller.ts";
import sourceController from "./source/controller.ts";
import spendingController from "./spending/controller.ts";
import configurationController from "./configuration/controller.ts";
import botController from "./bot/controller.ts";
import TelegramBot from "~/src/bot/client.ts";
import { webhookCallback } from "grammy";

/** HTTP Server */
const app = new Hono();

/** Telegram Bot  */
const bot = new TelegramBot();

const shouldUseWebhookMode = Deno.env.get("SHOULD_USE_WEBHOOK");
if (shouldUseWebhookMode) bot.start();
else app.use(webhookCallback(bot.getClientInstance(), "hono"));

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

app.route("/bot", botController);
app.route("/spendings", spendingController);
app.route("/categories", categoryController);
app.route("/sources", sourceController);
app.route("/limits", limitController);
app.route("/configs", configurationController);

cron.register(bot);

Deno.serve({ port: 8080 }, app.fetch);
