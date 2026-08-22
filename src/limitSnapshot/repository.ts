import { CATEGORY_TABLE } from "../category/repository.ts";
import { ApplicationPeriod } from "../limit/repository.ts";
import db from "../postgre.ts";
import { SOURCE_TABLE } from "../source/repository.ts";

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

  createdAt?: Date;
}

export interface ILimitSnapshotWithCategoryNameAndSourceName
  extends Omit<ILimitSnapshot, "categoryId" | "sourceId"> {
  categoryName?: string | null;
  sourceName?: string | null;
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

const getAllWithCategoryNameAndSourceName = async (): Promise<
  ILimitSnapshotWithCategoryNameAndSourceName[]
> => {
  const result = await db.selectFrom(SPENDING_LIMIT_SNAPSHOT_TABLE)
    .leftJoin(CATEGORY_TABLE, "spendingLimitSnapshot.categoryId", "category.id")
    .leftJoin(SOURCE_TABLE, "spendingLimitSnapshot.categoryId", "source.id")
    .select([
      "spendingLimitSnapshot.id as id",
      "spendingLimitSnapshot.name as name",
      "spendingLimitSnapshot.value as value",
      "spendingLimitSnapshot.descriptionKeywords as descriptionKeywords",
      "spendingLimitSnapshot.applicationPeriod as applicationPeriod",
      "spendingLimitSnapshot.usedValue as usedValue",
      "spendingLimitSnapshot.usedPercentage as usedPercentage",
      "spendingLimitSnapshot.createdAt as createdAt",
      "category.name as categoryName",
      "source.name as sourceName",
    ])
    .orderBy("spendingLimitSnapshot.createdAt desc")
    .execute();

  return result;
};

const limitSnapshotRepository = {
  createOne,
  getAllWithCategoryNameAndSourceName,
};

export default limitSnapshotRepository;
