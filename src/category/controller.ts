import { type Context, Hono } from "@hono/hono";
import { logger } from "@hono/logger";
import { cors } from "@hono/cors";
import { auth } from "../auth.ts";
import categoryService from "./service.ts";

const app = new Hono();

/** Middleware */
app.use(logger());
app.use(cors());

app.get("/", auth, async (c: Context) => {
  const categories = await categoryService.getAll();
  return c.json(categories);
});

export default app;
