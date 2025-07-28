import { type Context, Hono } from "@hono/hono";
import { cors, logger } from "@hono/middleware";
import { auth } from "../../middleware.ts";
import paydayConfigurationService from "./service.ts";

const app = new Hono();

/** Middleware */
app.use(logger());
app.use(cors());

app.post("/yearly", auth, async (c: Context) => {
  await paydayConfigurationService.populateForThisYear();

  return c.status(200);
});

app.get("/yearly", auth, async (c: Context) => {
  const paydays = await paydayConfigurationService.getAllThisYear();

  return c.json(paydays);
});

export default app;
