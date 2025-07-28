import dayjs from "dayjs";
import { indonesiaHolidaysMap } from "../data/holidays.ts";
import paydayConfigurationRepository, { IPayday } from "./repository.ts";

const PAYDAY_DATE = 25;

const getActualPaydayForMonthNum = (monthInNum: number): IPayday => {
  const expectedPayday = dayjs().month(monthInNum).date(PAYDAY_DATE);

  let actualPayday = expectedPayday;
  let invalidPayday = true;
  let adjustmentNote = "Regular payday";

  do {
    const isExpectedPaydayOnWeekend = [0, 6].includes(actualPayday.day()); // in dayjs, 0 is sunday, 6 is saturday

    if (isExpectedPaydayOnWeekend) {
      actualPayday = actualPayday.subtract(1, "day");
      adjustmentNote = "Actual payday is on weekend";
      continue;
    }

    const holidayOnPayday =
      indonesiaHolidaysMap[actualPayday.format("YYYY-MM-DD")];
    const isExpectedPaydayOnHoliday = !!holidayOnPayday;

    if (isExpectedPaydayOnHoliday) {
      actualPayday = actualPayday.subtract(1, "day");
      adjustmentNote = `Actual payday is on holiday - ${holidayOnPayday.name}`;
      continue;
    }

    invalidPayday = false;
  } while (invalidPayday);

  return {
    note: adjustmentNote,
    paydayDate: actualPayday.toDate(),
  } as IPayday;
};

const populateForThisYear = async (): Promise<void> => {
  const thisYearPopulatedPaydays = await paydayConfigurationRepository
    .getPaydaysForThisYear();

  const paydays = Array
    .from({ length: 12 }, (_, idx) => {
      return idx + 1;
    })
    .map(getActualPaydayForMonthNum)
    .filter((payday) => {
      const monthOfPayday = dayjs(payday.paydayDate).month();

      const existingPaydayForMonth = thisYearPopulatedPaydays.find(
        (populatedPaydays) => {
          return dayjs(populatedPaydays.paydayDate).month() === monthOfPayday;
        },
      );

      console.info(
        `Payday config for month ${monthOfPayday} already exists ${
          JSON.stringify(existingPaydayForMonth, null, 2)
        }. Skipping...`,
      );

      return !!existingPaydayForMonth;
    });

  await paydayConfigurationRepository.insertMany(paydays);

  console.info(`Finish creating payday configuration`);
};

const getAllThisYear = (): Promise<IPayday[]> => {
  return paydayConfigurationRepository.getPaydaysForThisYear();
};

const paydayConfigurationService = { populateForThisYear, getAllThisYear };

export default paydayConfigurationService;
