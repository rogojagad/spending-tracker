import { Hono } from "@hono/hono";
import { cors, logger } from "@hono/middleware";
import { Context } from "node:vm";
import jobService from "./service.ts";

const app = new Hono();

app.use(logger());
app.use(cors());

app.post("/eod", async (c: Context) => {
  await Promise.all([
    jobService.sendDailySummary(),
    jobService.sendDailySettlementReminderIfAny(),
    jobService.doEndOfMonthReconciliationIfApplied(),
  ]);
  return c.json({});
});

app.post("/eod/end-of-month", async (c: Context) => {
  console.log(c);
});

export default app;
