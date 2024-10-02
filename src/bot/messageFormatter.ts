import dayjs from "dayjs";
import { ITotalSpendingAmountByCategoryName } from "~/src/spending/repository.ts";

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
  \n\nTotal: IDR ${total}
  \n\n${
    totalSpendingPerCategoryName.map((entry) => {
      return `${entry.categoryName}: IDR ${entry.amount}`;
    }).join("\n")
  }
  `;
};

const messageFormatter = { formatDailyReport };

export default messageFormatter;
