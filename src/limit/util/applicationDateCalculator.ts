import dayjs from "dayjs";
import { ApplicationPeriod, ILimit } from "../repository.ts";
import paydayConfigurationService from "../../configuration/payday/service.ts";
import { IGetManySpendingsCreatedAtRangeFilter } from "~/src/spending/interface.ts";

const calculateLimitStartingApplicationDate = async (
  limit: ILimit,
): Promise<IGetManySpendingsCreatedAtRangeFilter> => {
  switch (limit.applicationPeriod) {
    case ApplicationPeriod.PAYDAY:
      return {
        fromInclusive: dayjs(
          (await paydayConfigurationService.getLatest()).paydayDate,
        ),
        toExclusive: dayjs(),
      };

    case ApplicationPeriod.DATE2DATE:
      throw new Error("Not implemented");

    case ApplicationPeriod.MONTHLY:
    default:
      return {
        fromInclusive: dayjs().startOf("month"),
        toExclusive: dayjs(),
      };
  }
};

const applicationDateCalculator = {
  calculateLimitStartingApplicationDate,
};

export default applicationDateCalculator;
