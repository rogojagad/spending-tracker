import spendingRepository, {
  ISpendingWithCategoryNameAndSourceName,
} from "~/src/spending/repository.ts";
import { IGetManySpendingsFilterQueryParam } from "~/src/spending/interface.ts";

const getManySpendings = async (
  filter: IGetManySpendingsFilterQueryParam,
): Promise<
  ISpendingWithCategoryNameAndSourceName[]
> => {
  return await spendingRepository
    .getSpendingsByCategoryIdSourceIdAndCreatedAtDatetimeRange(filter);
};

const spendingService = { getManySpendings };

export default spendingService;
