declare global {
  interface BigInt {
    toIDRString(): string;
  }
}

/**
 * Convenience:
 * Ease formatting amount to IDR formatted string.
 */
BigInt.prototype.toIDRString = function (): string {
  this;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" })
    .format(this as bigint);
};
