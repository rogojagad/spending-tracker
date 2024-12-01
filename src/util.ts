const formatAmountToIDR = (amount: bigint | number): string => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" })
    .format(amount);
};

export default { formatAmountToIDR };
