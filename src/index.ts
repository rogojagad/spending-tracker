import { Context, Hono } from "@hono/hono";
import { ZodError } from "zod";
import spendingRepository from "~/src/spending/repository.ts";
import {
  CreateSpendingRequestPayload,
  createSpendingRequestValidator,
} from "~/src/spending/schema.ts";

/** HTTP Server */
const app = new Hono();

/** Endpoints */
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

app.post("/spendings", async (c: Context, next) => {
  const body = await c.req.json();
  try {
    createSpendingRequestValidator.parse(body);
  } catch (error) {
    const thrownError = error as ZodError;
    console.error(thrownError.issues);
  }

  await next();
}, async (c: Context) => {
  const requestBody = await c.req.json<CreateSpendingRequestPayload>();
  const spending = await spendingRepository.createOneSpending(requestBody);

  return c.json({ data: spending });
});

Deno.serve({ port: 8080 }, app.fetch);
