import dayjs from "dayjs";
import {
  ITotalSpendingAmountByCategoryName,
  ITotalSpendingAmountBySourceNameAndCategoryName,
} from "~/src/spending/repository.ts";
import {
  ILimitCheckResult,
  MONTHLY_LIMIT_THRESHOLD_PERCENTAGE,
} from "../limit/service.ts";

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

const formatDailySettlementReport = (
  spendingAmountsPerSourceNameAndCategoryName:
    ITotalSpendingAmountBySourceNameAndCategoryName[],
): string => {
  type SourceName = string;

  const spendingPerCategoryBySourceName: Map<
    SourceName,
    ITotalSpendingAmountByCategoryName[]
  > = new Map();

  spendingAmountsPerSourceNameAndCategoryName.forEach((spending) => {
    const existingSpending = spendingPerCategoryBySourceName.get(
      spending.sourceName,
    ) || [];

    spendingPerCategoryBySourceName.set(
      spending.sourceName,
      existingSpending.concat(spending),
    );
  });

  let messageTemplate = "";

  spendingPerCategoryBySourceName.keys().forEach((sourceName) => {
    const totalSpendingFromSource = spendingPerCategoryBySourceName.get(
      sourceName,
    )?.reduce((prev, next) => {
      return prev + next.amount;
    }, 0) || 0;

    messageTemplate = messageTemplate.concat(
      `You spent ${totalSpendingFromSource.toIDRString()} from ${sourceName} today\n\n`,
      `Details:\n${
        formatCategorySpendingBreakdown(
          spendingPerCategoryBySourceName.get(
            sourceName,
          )!,
        )
      }\n\n`,
      `-----------\n\n`,
    );
  });

  return messageTemplate.concat(
    `Don't forget to transfer the fund to your appropriate credit card payment account.`,
  );
};

const formatLimitAlert = (
  limitsNeedAlert: ILimitCheckResult[],
): string => {
  const limitAlertMessage = limitsNeedAlert.map((limit) => {
    return `Limit Name: ${limit.name}\nLimit Value: ${limit.value.toIDRString()}\nCurrent Usage: ${limit.usedValue.toIDRString()}\nUsage Percentage: ${
      limit.usedPercentage.toFixed(2)
    }%
    `;
  }).join("-------\n");

  return `
  Alert! You have reached the ${MONTHLY_LIMIT_THRESHOLD_PERCENTAGE}% of your limit for following limits:
  -------\n${limitAlertMessage}
  `;
};

const messageFormatter = {
  formatDailyReport,
  formatMonthlyReport,
  formatDailySettlementReport,
  formatLimitAlert,
};

export default messageFormatter;
