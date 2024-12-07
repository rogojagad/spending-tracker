import {
  ClientPostgreSQL,
  NessieConfig,
} from "https://deno.land/x/nessie@2.0.11/mod.ts";

const DB_PASSWORD = Deno.env.get("POSTGRESQL_PASSWORD");

if (!DB_PASSWORD) throw new Error("DB password unconfigured");

const DB_USERNAME = Deno.env.get("POSTGRESQL_USERNAME");

if (!DB_USERNAME) throw new Error("DB username unconfigured");

const DB_HOST = Deno.env.get("POSTGRESQL_HOST");

if (!DB_HOST) throw new Error("DB host unconfigured");

const client = new ClientPostgreSQL({
  database: "postgres",
  hostname: DB_HOST,
  port: 5432,
  user: DB_USERNAME,
  password: DB_PASSWORD,
});

/** This is the final config object */
const config: NessieConfig = {
  client,
  migrationFolders: ["./db/migrations"],
  seedFolders: ["./db/seeds"],
};

export default config;
