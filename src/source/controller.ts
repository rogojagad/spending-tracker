import { type Context, Hono } from "@hono/hono";
import { cors, logger } from "@hono/middleware";
import { auth } from "../middleware.ts";
import sourceService from "./service.ts";

const app = new Hono();

/** Middleware */
app.use(logger());
app.use(cors());

app.get("/", auth, async (c: Context) => {
  const sources = await sourceService.getAll();
  return c.json(sources);
});

export default app;
