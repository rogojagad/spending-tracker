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

export default app;
