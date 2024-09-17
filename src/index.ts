import { Context, Hono } from "@hono/hono";
import spendingRepository from "~/src/spending/entity.ts";

/** HTTP Server */
const app = new Hono();

app.get("/ping", async (c: Context) => {
    console.log(
        await spendingRepository.createOneSpending({
            amount: 1000,
            description: "lorem",
        }),
    );
    return c.json({ data: "pong" });
});

Deno.serve({ port: 8080 }, app.fetch);
