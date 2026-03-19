import { type Context, Hono } from "@hono/hono";
import { logger } from "@hono/logger";
import { cors } from "@hono/cors";
import dayjs from "dayjs";
import spendingService from "./service.ts";
import {
  GetManySpendingsFilterQuery,
  IGetManySpendingsFilterQuery,
} from "./interface.ts";
import { auth } from "../middleware/auth.ts";
import { BulkCreateSpendingParamsSchema } from "./schemas.ts";
import { validatePayload } from "~/src/middleware/validation.ts";

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

  const getSpendingsFilters: IGetManySpendingsFilterQuery =
    new GetManySpendingsFilterQuery({
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

app.post(
  "/bulk",
  auth,
  validatePayload(BulkCreateSpendingParamsSchema),
  async (context) => {
    const payload = await context.req.json();
    const result = await spendingService.createManySpendings(payload);
    return context.json(result);
  },
);

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
