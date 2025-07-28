import dayjs from "dayjs";
import db from "../../postgre.ts";
import { sql } from "kysely";

export interface IPayday {
  id?: string;
  note: string;
  paydayDate: Date;
}

export const PAYDAY_TABLE = "payday";

const insertMany = async (paydays: IPayday[]): Promise<IPayday[]> => {
  const result = await db.insertInto(PAYDAY_TABLE).values(paydays)
    .returningAll()
    .execute();

  return result;
};

const getManyForRange = async (
  fromInclusive: dayjs.Dayjs,
  toExclusive: dayjs.Dayjs,
): Promise<IPayday[]> => {
  const paydays = await sql<IPayday>`
    select *
    from payday
    where payday_date >= ${fromInclusive.format("YYYY-MM-DD HH:mm:ss")}::date
    and payday_date < ${toExclusive.format("YYYY-MM-DD HH:mm:ss")}::date
    order by payday_date asc
  `.execute(db);

  return paydays.rows;
};

/*
 ***********************
 * Convenience Queries *
 **********************
 */
const getPaydaysForThisYear = async (): Promise<IPayday[]> => {
  return await getManyForRange(
    dayjs().startOf("year"),
    dayjs().add(1, "year").startOf("year"),
  );
};

const paydayConfigurationRepository = { insertMany, getPaydaysForThisYear };

export default paydayConfigurationRepository;
