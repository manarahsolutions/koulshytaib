import type { HTMLAttributes } from "react";
import { formatPriceIQD } from "@/lib/format/price";
import { cn } from "@/lib/utils/cn";

export type PriceProps = HTMLAttributes<HTMLSpanElement> & {
  amount: number;
  /** Struck-through original amount when discounted */
  compareAtAmount?: number;
  currencySuffix?: string;
  size?: "sm" | "md" | "lg";
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
  className,
  ...props
}: PriceProps) {
  const isDiscounted =
    typeof compareAtAmount === "number" && compareAtAmount > amount;

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-baseline gap-2 tabular-nums",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          sizeClass[size],
          "text-text",
          isDiscounted && "text-brand-primary",
        )}
      >
        <span className="sr-only">السعر: </span>
        {formatPriceIQD(amount, { currencySuffix })}
      </span>
      {isDiscounted ? (
        <span className="text-sm text-text-subtle line-through">
          <span className="sr-only">السعر السابق: </span>
          {formatPriceIQD(compareAtAmount, { currencySuffix })}
        </span>
      ) : null}
    </span>
  );
}
