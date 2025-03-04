import { type Context, Hono } from "@hono/hono";
import { cors, logger } from "@hono/middleware";
import TelegramBot from "~/src/bot/client.ts";
import cron from "~/src/cron.ts";
import spendingService from "~/src/spending/service.ts";
import categoryService from "~/src/category/service.ts";
import sourceService from "~/src/source/service.ts";
import { IGetManySpendingsFilterQueryParam } from "~/src/spending/interface.ts";
import dayjs from "dayjs";

/** HTTP Server */
const app = new Hono();

/** Telegram Bot  */
const bot = new TelegramBot();

bot.start();

/** Middleware */
app.use(logger());
app.use(cors());

/** Endpoints */
app.get("/ping", (c: Context) => {
  return c.json({ data: "pong" });
});

app.get("/spendings", async (c: Context) => {
  const { category = null, source = null, fromInclusive, toExclusive } = c.req
    .query();
  const getSpendingsFilters: IGetManySpendingsFilterQueryParam = {
    category,
    source,
    createdAt: {
      fromInclusive: fromInclusive
        ? dayjs(fromInclusive)
        : dayjs().startOf("day"), // if date filter not provided, default to today
      toExclusive: toExclusive ? dayjs(toExclusive) : dayjs().endOf("day"),
    },
  };
  const spendings = await spendingService.getManySpendings(getSpendingsFilters);
  return c.json(spendings);
});

app.get("/categories", async (c: Context) => {
  const categories = await categoryService.getAll();
  return c.json(categories);
});

app.get("/sources", async (c: Context) => {
  const sources = await sourceService.getAll();
  return c.json(sources);
});

cron.register(bot);

Deno.serve({ port: 8080 }, app.fetch);
