import { Dayjs } from "dayjs";

export interface IGetManySpendingsFilterQueryParam {
  category: string | null;
  source: string | null;
  createdAt: IGetManySpendingsCreatedAtRangeFilter;
}

export interface IGetManySpendingsCreatedAtRangeFilter {
  fromInclusive: Dayjs;
  toExclusive: Dayjs;
}
