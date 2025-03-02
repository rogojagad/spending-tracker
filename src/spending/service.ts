import spendingRepository, {
  ISpendingWithCategoryNameAndSourceName,
} from "~/src/spending/repository.ts";
import dayjs from "dayjs";

const getManySpendings = async (): Promise<
  ISpendingWithCategoryNameAndSourceName[]
> => {
  const startFromInclusive = dayjs().subtract(1, "week").startOf("day"); // TODO: Accept from params
  const toExclusive = dayjs().add(1, "day").startOf("day"); // TODO: Accept from params

  return await spendingRepository
    .getAllSpendingsByDatetimeRangeSortByCategoryThenCreatedAt(
      startFromInclusive,
      toExclusive,
    );
};

const spendingService = { getManySpendings };

export default spendingService;
