import dayjs from "dayjs";

const formatDailyReport = (
  totalSpendingPerCategoryName: Map<string, number>,
): string => {
  const today = dayjs().format("DD MMMM YYYY");
  const total = [...totalSpendingPerCategoryName.values()].reduce(
    (prev, next) => {
      return prev + next;
    },
    0,
  );

  return `
  Spending report for ${today}
  \n\n
  Total: IDR ${total}
  \n\n
  ${
    Array.from(totalSpendingPerCategoryName).map(([key, value]) => {
      return `${key}: ${value}`;
    }).join("\n")
  }
  `;
};

const messageFormatter = { formatDailyReport };

export default messageFormatter;
