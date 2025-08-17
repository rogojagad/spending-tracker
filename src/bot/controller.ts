import { Hono } from "@hono/hono";
import { cors, logger } from "@hono/middleware";
import { Context } from "node:vm";

const app = new Hono();

/** Middleware */
app.use(logger());
app.use(cors());

app.post("/messages", (c: Context) => {
  console.info(JSON.stringify(c.req, null, 2));
  return c.json({ data: "OK" });
});

export default app;
