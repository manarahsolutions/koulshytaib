import type { HTMLAttributes } from "react";
import { formatPriceIQD } from "@/lib/format/price";
import { cn } from "@/lib/utils/cn";

export type PriceProps = HTMLAttributes<HTMLSpanElement> & {
  amount: number;
  /** Struck-through original amount when discounted */
  compareAtAmount?: number;
  currencySuffix?: string;
  size?: "sm" | "md" | "lg";
  /**
   * When discounted, stack sale + compare prices vertically (better for narrow cards).
   * Default: side-by-side wrap.
   */
  stack?: boolean;
};

const sizeClass = {
  sm: "text-sm",
  md: "typo-price",
  lg: "text-xl font-bold",
} as const;

export function Price({
  amount,
  compareAtAmount,
  currencySuffix = "د.ع",
  size = "md",
  stack = false,
  className,
  ...props
}: PriceProps) {
  const isDiscounted =
    typeof compareAtAmount === "number" && compareAtAmount > amount;

  return (
    <span
      className={cn(
        "inline-flex tabular-nums",
        stack && isDiscounted
          ? "flex-col items-start gap-0.5"
          : "flex-wrap items-baseline gap-x-2 gap-y-0.5",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          sizeClass[size],
          "whitespace-nowrap text-text",
          isDiscounted && "text-brand-primary",
        )}
      >
        <span className="sr-only">السعر: </span>
        {formatPriceIQD(amount, { currencySuffix })}
      </span>
      {isDiscounted ? (
        <span className="whitespace-nowrap text-xs text-text-subtle line-through">
          <span className="sr-only">السعر السابق: </span>
          {formatPriceIQD(compareAtAmount, { currencySuffix })}
        </span>
      ) : null}
    </span>
  );
}
