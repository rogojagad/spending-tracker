import jobService from "./job/service.ts";

const register = () => {
  Deno.cron("Daily Report", "59 16 * * *", async () => {
    await Promise.all([
      jobService.sendDailySummary(),
      jobService.sendDailySettlementReminderIfAny(),
      jobService.doEndOfMonthReconciliationIfApplied(),
      jobService.snapshotLimitUsage(),
    ]);

    console.log(`Finished cron...`);
  });
};

export default { register };
