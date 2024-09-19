import postgres from "postgres";

const DB_PASSWORD = Deno.env.get("POSTGRESQL_PASSWORD");

if (!DB_PASSWORD) throw new Error("DB password unconfigured");

const DB_URL =
    `postgresql://postgres.ecmrvcaaigkkfsavgioe:${DB_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;

const sql = postgres(DB_URL, { max: 3 });

export default sql;
