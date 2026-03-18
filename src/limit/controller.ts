import { type Context, Hono } from "@hono/hono";
import { logger } from "@hono/logger";
import { cors } from "@hono/cors";
import { auth } from "../auth.ts";
import limitService from "./service.ts";

const app = new Hono();

/** Middleware */
app.use(logger());
app.use(cors());

app.get("/", auth, async (c: Context) => {
  const limits = await limitService.getAll();
  const sources = await limitService.calculateLimitsUsage(limits);
  return c.json(sources);
});

export default app;
