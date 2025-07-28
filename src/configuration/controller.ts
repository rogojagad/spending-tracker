import { Hono } from "@hono/hono";
import { cors, logger } from "@hono/middleware";

import paydayConfigurationController from "./payday/controller.ts";

const app = new Hono();

app.use(logger());
app.use(cors());

app.route("/paydays", paydayConfigurationController);

export default app;
