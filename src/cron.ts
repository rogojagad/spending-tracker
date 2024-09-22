import ky from "ky";

/** Just to keep the instance alive, so that not counted as "idle" and the instance is terminated */
Deno.cron("Keep Alive", "1 * * * *", async () => {
  await ky.get("0.0.0.0:80");
});
