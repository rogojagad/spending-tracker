import dayjs from "dayjs";
import { ApplicationPeriod, ILimit } from "../repository.ts";
import paydayConfigurationService from "../../configuration/payday/service.ts";

const calculateLimitStartingApplicationDate = async (
  limit: ILimit,
): Promise<dayjs.Dayjs> => {
  switch (limit.applicationPeriod) {
    case ApplicationPeriod.PAYDAY:
      return dayjs((await paydayConfigurationService.getLatest()).paydayDate);

    case ApplicationPeriod.DATE2DATE:
      throw new Error("Not implemented");

    case ApplicationPeriod.MONTHLY:
    default:
      return dayjs().startOf("month");
  }
};

const applicationDateCalculator = {
  calculateLimitStartingApplicationDate,
};

export default applicationDateCalculator;
