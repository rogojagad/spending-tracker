import postgres from "postgres";
import { Kysely } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import { ISpending } from "./spending/repository.ts";
import { ICategory } from "./category/repository.ts";

interface IDatabase {
  category: ICategory;
  spending: ISpending;
}

const DB_PASSWORD = Deno.env.get("POSTGRESQL_PASSWORD");

if (!DB_PASSWORD) throw new Error("DB password unconfigured");

const DB_USERNAME = Deno.env.get("POSTGRESQL_USERNAME");

if (!DB_USERNAME) throw new Error("DB username unconfigured");

const DB_HOST = Deno.env.get("POSTGRESQL_HOST");

if (!DB_HOST) throw new Error("DB host unconfigured");

const DB_URL = `postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/postgres`;

const postgresInstance = postgres(DB_URL, {
  max: 3,
  transform: postgres.toCamel,
  types: {
    bigint: postgres.BigInt,
  },
});

const dialect = new PostgresJSDialect({ postgres: postgresInstance });

const db = new Kysely<IDatabase>({ dialect });

export default db;
