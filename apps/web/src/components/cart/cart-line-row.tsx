"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FoodMediaPlaceholder } from "@/components/product/food-media-placeholder";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import {
  formatSelectionsSummary,
  type SelectedOption,
} from "@/features/products/product-options";
import { formatPriceIQD } from "@/lib/format/price";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/catalog";

export type CartLineRowProps = {
  productId: string;
  quantity: number;
  notes?: string;
  selections?: SelectedOption[];
  unitPrice: number;
  product: Product | undefined;
  available: boolean;
  onQuantityChange: (next: number) => void;
  onRemove: () => void;
  className?: string;
};

export function CartLineRow({
  productId,
  quantity,
  notes,
  selections = [],
  unitPrice,
  product,
  available,
  onQuantityChange,
  onRemove,
  className,
}: CartLineRowProps) {
  const name = product?.name ?? "منتج غير متاح";
  const lineTotal = unitPrice * quantity;
  const hasImage = Boolean(product?.imageSrc);
  const optionsSummary = formatSelectionsSummary(selections);

  return (
    <li
      className={cn(
        "flex gap-3 rounded-2xl border border-border-soft bg-surface-elevated p-3 shadow-xs",
        className,
      )}
    >
      <Link
        href={product ? `/product/${productId}` : "/menu"}
        className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        {hasImage && product?.imageSrc ? (
          <Image
            src={product.imageSrc}
            alt={product.imageAlt ?? name}
            fill
            className="object-cover"
            sizes="72px"
          />
        ) : (
          <FoodMediaPlaceholder className="min-h-full" tone="cream" />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {product ? (
              <Link
                href={`/product/${product.id}`}
                className="text-sm font-semibold text-text hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              >
                {name}
              </Link>
            ) : (
              <p className="text-sm font-semibold text-text">{name}</p>
            )}
            <div className="mt-0.5">
              <Price amount={unitPrice} size="sm" />
            </div>
            {optionsSummary ? (
              <p className="typo-caption mt-1 text-text-muted">{optionsSummary}</p>
            ) : null}
          </div>
          <p className="shrink-0 text-sm font-semibold tabular-nums text-brand-primary">
            {formatPriceIQD(lineTotal)}
          </p>
        </div>

        {!available ? (
          <p
            className="mt-2 rounded-xl border border-warning/40 bg-warning-subtle px-2.5 py-1.5 text-xs font-medium text-warning-text"
            role="status"
          >
            {product
              ? "غير متوفر حالياً — تبقى بالسلة لحد ما تشيلها"
              : "هذا المنتج ما عاد موجود بالمنيو"}
          </p>
        ) : null}

        {notes ? (
          <p className="typo-caption mt-1.5 text-text-muted">ملاحظة: {notes}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <QuantityStepper
            value={quantity}
            min={0}
            max={available ? 99 : quantity}
            aria-label={`كمية ${name}`}
            onChange={(next) => {
              if (!available && next > quantity) return;
              onQuantityChange(next);
            }}
          />
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex size-10 items-center justify-center rounded-xl text-danger hover:bg-danger-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            aria-label={`حذف ${name}`}
          >
            <Trash2
              className="size-4"
              strokeWidth={ICON_STROKE.default}
              aria-hidden
            />
          </button>
        </div>
      </div>
    </li>
  );
}
