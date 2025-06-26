import { type Context, Hono } from "@hono/hono";
import { cors, logger } from "@hono/middleware";
import { auth } from "../middleware.ts";
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
