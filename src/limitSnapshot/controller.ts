import { Context, Hono } from "@hono/hono";
import { logger } from "@hono/logger";
import { cors } from "@hono/cors";
import { auth } from "../middleware/auth.ts";
import limitSnapshotService from "./service.ts";

const app = new Hono();

/** Middleware */
app.use(logger());
app.use(cors());

app.get("/", auth, async (c: Context) => {
  const snapshots = await limitSnapshotService
    .getAllWithCategoryNameAndSourceName();
  return c.json(snapshots);
});

export default app;
