import dayjs from "dayjs";
import { ApplicationPeriod, ILimit } from "../repository.ts";
import paydayConfigurationService from "../../configuration/payday/service.ts";
import { IGetManySpendingsCreatedAtRangeFilter } from "~/src/spending/interface.ts";

const calculateLimitApplicationDateRange = async (
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

    case ApplicationPeriod.DATE2DATE: {
      /**
       * For now I only need `DATE2DATE` but later it could be `YEAR2YEAR` or `WEEK2WEEK` something like that...\
       * I am not sure how varied it will be.
       *
       * I need this for my credit card limit application, which is neither `PAYDAY` nor `MONTHLY` period.
       * Because the limit application range is "from Xth date of this month to the Xth date of next month".
       *
       * To avoid over engineering and major possible rework on `limit` table (or creating unnecessary new table), I will scope the limit to
       * - use this for Credit Card limit only
       * - use `DATE2DATE` type of application period -- which calculates the limits from Xth of previous / current month until Xth of the next month
       * - where X will be stored in ENV_VAR -- not hardcoded (coz of privacy :-P), if the value is changed I can just change it via Deno Deployment Console.
       *    the redeployment will be handled by the deployment console.
       *
       * Will revisit this if further usecase is clearer :cheers:
       */

      // assuming I pay the bill on the billing date, so the limit is restored on the same day.
      const creditCardBillingDate = Deno.env.get("DATE2DATE_LIMIT_CREDIT_CARD");

      if (!creditCardBillingDate) {
        throw new Error("DATE2DATE_LIMIT_CREDIT_CARD is not set");
      }

      const creditCardBillingDateInNumber = Number(creditCardBillingDate);
      const now = dayjs();
      const thisMonthBillingDate = now.date(creditCardBillingDateInNumber);

      const fromInclusive = now.isBefore(thisMonthBillingDate)
        ? dayjs().subtract(1, "month").date(creditCardBillingDateInNumber)
        : thisMonthBillingDate;

      return { fromInclusive, toExclusive: now };
    }

    case ApplicationPeriod.MONTHLY:
    default:
      return {
        fromInclusive: dayjs().startOf("month"),
        toExclusive: dayjs(),
      };
  }
};

const applicationDateCalculator = {
  calculateLimitApplicationDateRange,
};

export default applicationDateCalculator;
