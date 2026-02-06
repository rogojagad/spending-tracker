import { type Context, Hono } from "@hono/hono";
import { cors, logger } from "@hono/middleware";
import jobService from "./service.ts";
import { JobType } from "./enum.ts";
import { auth } from "../middleware.ts";

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

app.post("/eod/end-of-month", auth, async (c: Context) => {
  const { name } = c.req.query();

  switch (name) {
    case JobType.EOM_SNAPSHOT_LIMIT_USAGE:
      await jobService.snapshotLimitUsage();
      break;

    default:
      break;
  }

  return c.json({});
});

export default app;
