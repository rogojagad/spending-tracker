import { type Context, Hono } from "@hono/hono";
import { cors, logger } from "@hono/middleware";
import dayjs from "dayjs";
import spendingService from "./service.ts";
import { IGetManySpendingsFilterQueryParam } from "./interface.ts";
import { auth } from "../middleware.ts";

const app = new Hono();

/** Middleware */
app.use(logger());
app.use(cors());

app.get("/", auth, async (c: Context) => {
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

app.get("/summaries/months", auth, async (c: Context) => {
  const summaries = await spendingService.getMonthlySpendingSummaries();
  return c.json(summaries);
});

export default app;
