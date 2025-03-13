import dayjs from "dayjs";
import { ITotalSpendingAmountByCategoryName } from "~/src/spending/repository.ts";

const formatCategorySpendingBreakdown = (
  totalSpendingPerCategoryName: ITotalSpendingAmountByCategoryName[],
): string => {
  return totalSpendingPerCategoryName.map((entry) => {
    return `${entry.categoryName}: ${entry.amount.toIDRString()}`;
  }).join("\n");
};

const formatDailyReport = (
  totalSpendingPerCategoryName: ITotalSpendingAmountByCategoryName[],
): string => {
  const today = dayjs().format("DD MMMM YYYY");
  console.log(totalSpendingPerCategoryName);
  const total = totalSpendingPerCategoryName.reduce(
    (prev, next) => {
      return prev + next.amount;
    },
    0,
  );

  return `
  Spending report for ${today}
  \n\nTotal: ${total.toIDRString()}
  \n\n${formatCategorySpendingBreakdown(totalSpendingPerCategoryName)}
  `;
};

const formatMonthlyReport = (
  totalSpendingPerCategoryName: ITotalSpendingAmountByCategoryName[],
): string => {
  const monthInYear = dayjs().format("MMMM YYYY");

  const total = totalSpendingPerCategoryName.reduce(
    (prev, next) => {
      return prev + next.amount;
    },
    0,
  );

  return `
  Monthly spending report for ${monthInYear}
  \n\nTotal: ${total.toIDRString()}
  \n\n${
    totalSpendingPerCategoryName.map((entry) => {
      return `${entry.categoryName}: ${entry.amount.toIDRString()}`;
    }).join("\n")
  }
  `;
};

const formatCreditCardDailySettlementReport = (
  creditCardSpendingAmountPerCategory: ITotalSpendingAmountByCategoryName[],
): string => {
  const totalCreditCardSpendingAmount = creditCardSpendingAmountPerCategory
    .reduce((prev, current) => {
      return current.amount + prev;
    }, 0);

  return `
    You spent ${totalCreditCardSpendingAmount.toIDRString()} on credit card today.
    \n\nDetails:\n${
    formatCategorySpendingBreakdown(creditCardSpendingAmountPerCategory)
  }
    \n\nDon't forget to transfer the fund to your appropriate credit card payment account.
  `;
};

const messageFormatter = {
  formatDailyReport,
  formatMonthlyReport,
  formatCreditCardDailySettlementReport,
};

export default messageFormatter;
