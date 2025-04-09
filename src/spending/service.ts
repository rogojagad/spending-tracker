import spendingRepository, {
  ISpendingWithCategoryNameAndSourceName,
  ITotalSpendingAmountByMonthAndCategoryName,
} from "~/src/spending/repository.ts";
import { IGetManySpendingsFilterQueryParam } from "~/src/spending/interface.ts";

const getManySpendings = (
  filter: IGetManySpendingsFilterQueryParam,
): Promise<
  ISpendingWithCategoryNameAndSourceName[]
> => {
  return spendingRepository
    .getSpendingsByCategoryIdSourceIdAndCreatedAtDatetimeRange(filter);
};

const getMonthlySpendingSummaries = (): Promise<
  ITotalSpendingAmountByMonthAndCategoryName[]
> => {
  return spendingRepository.getSpendingSummariesGroupByMonthAndCategoryName();
};

const spendingService = { getManySpendings, getMonthlySpendingSummaries };

export default spendingService;
