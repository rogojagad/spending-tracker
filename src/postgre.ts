import postgres from "postgres";
import { Kysely } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import { ISpending } from "~/src/spending/repository.ts";
import { ICategory } from "~/src/category/repository.ts";
import { CamelCasePlugin } from "kysely";
import { ISource } from "~/src/source/repository.ts";
import { ILimit } from "./limit/repository.ts";
import { IPayday } from "./configuration/payday/repository.ts";

interface IDatabase {
  category: ICategory;
  spending: ISpending;
  source: ISource;
  spendingLimit: ILimit;
  payday: IPayday;
}

const DB_PASSWORD = Deno.env.get("POSTGRESQL_PASSWORD");

if (!DB_PASSWORD) throw new Error("DB password unconfigured");

const DB_USERNAME = Deno.env.get("POSTGRESQL_USERNAME");

if (!DB_USERNAME) throw new Error("DB username unconfigured");

const DB_HOST = Deno.env.get("POSTGRESQL_HOST");

if (!DB_HOST) throw new Error("DB host unconfigured");

const DB_URL = `postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/postgres`;
console.log(DB_URL);

export const postgresInstance = postgres(DB_URL, {
  max: 3,
  transform: postgres.toCamel,
  types: {
    numeric: {
      from: [1700],
      parse: function (val: string) {
        return parseFloat(val);
      },
      to: 1700,
      serialize: function (value: any): unknown {
        return (value as number).toString();
      },
    },
  },
});

const dialect = new PostgresJSDialect({ postgres: postgresInstance });

const db = new Kysely<IDatabase>({ dialect, plugins: [new CamelCasePlugin()] });

export default db;
