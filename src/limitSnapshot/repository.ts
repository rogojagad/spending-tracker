import { ApplicationPeriod } from "../limit/repository.ts";
import db from "../postgre.ts";

export const SPENDING_LIMIT_SNAPSHOT_TABLE = "spendingLimitSnapshot";

export interface ILimitSnapshot {
  // OG limit fields
  id?: string;
  name: string;
  value: number;
  categoryId?: string;
  sourceId?: string;
  descriptionKeywords?: string[];
  applicationPeriod: ApplicationPeriod;

  // Snapshot fields
  usedValue: number;
  usedPercentage: number;
}

const createOne = async (
  limitSnapshot: ILimitSnapshot,
): Promise<ILimitSnapshot> => {
  const result = await db.insertInto(SPENDING_LIMIT_SNAPSHOT_TABLE)
    .values(limitSnapshot)
    .returningAll()
    .executeTakeFirst();

  if (!result) {
    throw new Error(
      `Failed to insert limit snapshot | ${
        JSON.stringify(limitSnapshot, null, 2)
      }`,
    );
  }

  return result;
};

const limitSnapshotRepository = {
  createOne,
};

export default limitSnapshotRepository;
