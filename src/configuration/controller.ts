import { Context, Hono } from "@hono/hono";
import { cors, logger } from "@hono/middleware";

import { auth } from "../middleware.ts";
import paydayConfigurationService from "./payday/service.ts";

const app = new Hono();

app.use(logger());
app.use(cors());

app.post("/paydays/yearly", auth, async (c: Context) => {
  await paydayConfigurationService.populateForThisYear();

  return c.json({});
});

app.get("/paydays/yearly", auth, async (c: Context) => {
  const paydays = await paydayConfigurationService.getAllThisYear();

  return c.json(paydays);
});

app.get("/paydays/latest", auth, async (c: Context) => {
  const paydays = await paydayConfigurationService.getLatest();
  return c.json(paydays);
});

app.get("secrets/db", auth, async (c: Context) => {
  const DB_PASSWORD = Deno.env.get("POSTGRESQL_PASSWORD");

  if (!DB_PASSWORD) throw new Error("DB password unconfigured");

  const DB_USERNAME = Deno.env.get("POSTGRESQL_USERNAME");

  if (!DB_USERNAME) throw new Error("DB username unconfigured");

  const DB_HOST = Deno.env.get("POSTGRESQL_HOST");

  if (!DB_HOST) throw new Error("DB host unconfigured");

  return c.json({ DB_PASSWORD, DB_USERNAME, DB_HOST });
});

export default app;
