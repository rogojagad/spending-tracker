import { Context, Hono } from "@hono/hono";
import spendingRepository from "~/src/spending/repository.ts";

/** HTTP Server */
const app = new Hono();

app.get("/ping", (c: Context) => {
  return c.json({ data: "pong" });
});

app.get("/spendings", async (c: Context) => {
  const spendings = await spendingRepository.getAll();

  return c.json({ data: spendings });
});

app.get("/spendings/:id", async (c: Context) => {
  const { id } = c.req.param();
  const spending = await spendingRepository.getOneById(id);

  return c.json({ data: spending });
});

Deno.serve({ port: 8080 }, app.fetch);
