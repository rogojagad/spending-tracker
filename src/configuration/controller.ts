import { Context, Hono } from "@hono/hono";
import { logger } from "@hono/logger";
import { cors } from "@hono/cors";

import { auth } from "~/src/core/middleware/auth.ts";
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

export default app;
