import ky from "ky";

function register() {
  /** Just to keep the instance alive, so that not counted as "idle" and the instance is terminated */
  Deno.cron("Keep Alive", "* * * * *", async () => {
    const result = await ky.get("https://127.0.0.1:80");

    console.log(`Keep alive result: ${await result.json()}`);
  });
}

export default { register };
