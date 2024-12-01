import dayjs from "dayjs";
import { ITotalSpendingAmountByCategoryName } from "~/src/spending/repository.ts";
import util from "~/src/util.ts";

const formatDailyReport = (
  totalSpendingPerCategoryName: ITotalSpendingAmountByCategoryName[],
): string => {
  const today = dayjs().format("DD MMMM YYYY");
  console.log(totalSpendingPerCategoryName);
  const total = totalSpendingPerCategoryName.reduce(
    (prev, next) => {
      return prev + BigInt(next.amount);
    },
    0n,
  );

  return `
  Spending report for ${today}
  \n\nTotal: ${util.formatAmountToIDR(total)}
  \n\n${
    totalSpendingPerCategoryName.map((entry) => {
      return `${entry.categoryName}: ${util.formatAmountToIDR(entry.amount)}`;
    }).join("\n")
  }
  `;
};

const formatMonthlyReport = (
  totalSpendingPerCategoryName: ITotalSpendingAmountByCategoryName[],
): string => {
  const monthInYear = dayjs().format("MMMM YYYY");

  const total = totalSpendingPerCategoryName.reduce(
    (prev, next) => {
      return prev + BigInt(next.amount);
    },
    0n,
  );

  return `
  Monthly spending report for ${monthInYear}
  \n\nTotal: ${util.formatAmountToIDR(total)}
  \n\n${
    totalSpendingPerCategoryName.map((entry) => {
      return `${entry.categoryName}: ${util.formatAmountToIDR(entry.amount)}`;
    }).join("\n")
  }
  `;
};

const messageFormatter = { formatDailyReport, formatMonthlyReport };

export default messageFormatter;
