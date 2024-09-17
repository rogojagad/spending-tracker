import { Pool, QueryArguments, QueryObjectResult } from "postgres";

const DB_PASSWORD = Deno.env.get("POSTGRESQL_PASSWORD");

if (!DB_PASSWORD) throw new Error("DB password unconfigured");

const DB_URL =
    `postgresql://postgres.ecmrvcaaigkkfsavgioe:${DB_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;

const pool = new Pool(DB_URL, 3, true);

const runQuery = async <T>(
    query: string,
    queryArgs?: QueryArguments,
): Promise<QueryObjectResult<T>> => {
    using client = await pool.connect();
    return await client.queryObject<T>(query, queryArgs);
};

export default runQuery;
