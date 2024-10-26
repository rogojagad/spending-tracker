import { type Context, Hono } from "@hono/hono";
import { logger } from "@hono/middleware";
import spendingRepository from "~/src/spending/repository.ts";
import {
  CreateSpendingRequestPayload,
  createSpendingRequestSchema,
} from "~/src/spending/schema.ts";
import { bodyValidator } from "~/src/middleware/bodyValidator.ts";
import TelegramBot from "~/src/bot/client.ts";
import TelegramBotHandler from "~/src/bot/handler.ts";
import cron from "~/src/cron.ts";
import dayjs from "dayjs";
import spreadsheetRepository from "~/src/spreadsheet/repository.ts";

/** HTTP Server */
const app = new Hono();

/** Telegram Bot  */
const bot = new TelegramBot(new TelegramBotHandler());

bot.start();

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

app.post(
  "/report/month",
  async (c: Context) => {
    const thisMonthSpendings = await spendingRepository
      .getAllSpendingsThisMonth();
    console.log(thisMonthSpendings);
    const sheetTitle = dayjs().format("DD-MMMM-YYYY");
    await spreadsheetRepository.createNewSheet(sheetTitle);
    await spreadsheetRepository.recordSpendings(
      sheetTitle,
      thisMonthSpendings,
    );

    return c.json({});
  },
);

cron.register(bot);

Deno.serve({ port: 8080 }, app.fetch);
