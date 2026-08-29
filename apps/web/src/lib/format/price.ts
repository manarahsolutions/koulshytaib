export type FormatPriceOptions = {
  /** Use western digits with Arabic currency suffix by default. */
  locale?: string;
  currencySuffix?: string;
};

/**
 * Formats an amount for Iraqi Dinar display, e.g. `12,000 د.ع`.
 * Does not invent product data — formatting helper only.
 */
export function formatPriceIQD(
  amount: number,
  options: FormatPriceOptions = {},
): string {
  const { locale = "en-IQ", currencySuffix = "د.ع" } = options;
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} ${currencySuffix}`;
}
