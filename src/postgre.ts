import postgres from "postgres";

const DB_PASSWORD = Deno.env.get("POSTGRESQL_PASSWORD");

if (!DB_PASSWORD) throw new Error("DB password unconfigured");

const DB_USERNAME = Deno.env.get("POSTGRESQL_USERNAME");

if (!DB_USERNAME) throw new Error("DB username unconfigured");

const DB_HOST = Deno.env.get("POSTGRESQL_HOST");

if (!DB_HOST) throw new Error("DB host unconfigured");

const DB_URL = `postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/postgres`;

const sql = postgres(DB_URL, { max: 3 });

export default sql;
