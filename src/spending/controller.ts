import { type Context, Hono } from "@hono/hono";
import { cors, logger } from "@hono/middleware";
import dayjs from "dayjs";
import spendingService from "./service.ts";
import {
  GetManySpendingsFilterQueryParam,
  IGetManySpendingsFilterQueryParam,
} from "./interface.ts";
import { auth } from "../middleware.ts";

const app = new Hono();

/** Middleware */
app.use(logger());
app.use(cors());

app.get("/", auth, async (c: Context) => {
  const {
    category = null,
    source = null,
    fromInclusive,
    toExclusive,
  } = c.req
    .query();

  const getSpendingsFilters: IGetManySpendingsFilterQueryParam =
    new GetManySpendingsFilterQueryParam({
      category,
      source,
      createdAtFromInclusive: fromInclusive
        ? dayjs(fromInclusive)
        : dayjs().startOf("day"), // if date filter not provided, default to today
      createdAtToExclusive: toExclusive
        ? dayjs(toExclusive)
        : dayjs().endOf("day"),
      descriptionKeywords: null,
    });

  const spendings = await spendingService.getManySpendings(getSpendingsFilters);
  return c.json(spendings);
});

app.get("/summaries/months", auth, async (c: Context) => {
  const summaries = await spendingService.getMonthlySpendingSummaries();
  return c.json(summaries);
});

app.get("/summaries/months/csv", auth, async (c: Context) => {
  const content = await spendingService.downloadMonthlySummary();

  c.header("Content-Type", "text/csv");
  c.header(
    "Content-Disposition",
    `attachment; filename="spending-summary.csv"`,
  );

  return c.body(content);
});

export default app;
