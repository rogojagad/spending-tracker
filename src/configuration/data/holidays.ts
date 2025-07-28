import indonesiaHolidays from "~/resources/indonesia-holidays.json" with {
  type: "json",
};
import { associateBy } from "@deno/collection";
import dayjs from "dayjs";

export const indonesiaHolidaysMap = associateBy(
  indonesiaHolidays,
  (holiday) => dayjs(holiday.date).format("YYYY-MM-DD"),
);
