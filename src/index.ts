import { cors, logger } from "@hono/middleware";
import { generateToken, validatePassword } from "~/src/middleware.ts";
import { type Context, Hono } from "@hono/hono";
import categoryController from "./category/controller.ts";
import cron from "~/src/cron.ts";
import sourceController from "./source/controller.ts";
import spendingController from "./spending/controller.ts";
import TelegramBot from "~/src/bot/client.ts";

/** HTTP Server */
const app = new Hono();

/** Telegram Bot  */
const bot = new TelegramBot();

bot.start();

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

cron.register(bot);

Deno.serve({ port: 8080 }, app.fetch);
