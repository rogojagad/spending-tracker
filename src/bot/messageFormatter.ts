import dayjs from "dayjs";

const formatDailyReport = (
  totalSpendingPerCategoryName: Map<string, bigint>,
): string => {
  const today = dayjs().format("DD MMMM YYYY");
  console.log([...totalSpendingPerCategoryName.values()]);
  const total = [...totalSpendingPerCategoryName.values()].reduce(
    (prev, next) => {
      return prev + next;
    },
    0n,
  );

  return `
  Spending report for ${today}
  \n\nTotal: IDR ${total}
  \n\n${
    Array.from(totalSpendingPerCategoryName).map(([key, value]) => {
      return `${key}: IDR ${value}`;
    }).join("\n")
  }
  `;
};

const messageFormatter = { formatDailyReport };

export default messageFormatter;
