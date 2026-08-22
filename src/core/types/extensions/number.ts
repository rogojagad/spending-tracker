declare global {
  interface Number {
    toIDRString(): string;
  }
}

/**
 * Convenience: Ease formatting amount to IDR formatted string.
 */
if (!Number.prototype.toIDRString) {
  Number.prototype.toIDRString = function (): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    })
      .format(this as number);
  };
}

export {};
