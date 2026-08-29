"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import {
  selectCartItemQuantity,
  useCartStore,
} from "@/features/cart/cart-store";
import { isProductAvailable } from "@/features/products/selectors";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/catalog";
import { FoodMediaPlaceholder } from "./food-media-placeholder";

export type ProductCardProps = {
  product: Product;
  /** Optional override — default wires to cart store */
  onAdd?: (product: Product) => void;
  className?: string;
  layout?: "rail" | "grid" | "list";
};

const badgeVariant = {
  popular: "neutral",
  new: "neutral",
  discount: "brand",
} as const;

export function ProductCard({
  product,
  onAdd,
  className,
  layout = "grid",
}: ProductCardProps) {
  const badge = (product.badges ?? [])[0];
  const hasImage = Boolean(product.imageSrc);
  const available = isProductAvailable(product);
  const quantity = useCartStore((s) =>
    selectCartItemQuantity(s, product.id),
  );
  const addItem = useCartStore((s) => s.addItem);
  const setQuantity = useCartStore((s) => s.setQuantity);

  const handleAdd = () => {
    if (!available) return;
    if (onAdd) {
      onAdd(product);
      return;
    }
    addItem(product.id, 1);
  };

  if (layout === "list") {
    return (
      <article
        className={cn(
          "group relative flex items-stretch gap-3 overflow-hidden rounded-2xl bg-surface-elevated p-3 shadow-xs",
          "motion-lift hover:shadow-sm",
          "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring",
          !available && "opacity-90",
          className,
        )}
      >
        <Link
          href={`/product/${product.id}`}
          className="relative size-[5.25rem] shrink-0 overflow-hidden rounded-xl bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:size-24"
        >
          {hasImage && product.imageSrc ? (
            <Image
              src={product.imageSrc}
              alt={product.imageAlt ?? product.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <FoodMediaPlaceholder label="صورة الطبق لاحقاً" tone="cream" />
          )}
          {!available ? (
            <span className="absolute inset-x-0 bottom-0 bg-brand-navy/80 py-0.5 text-center text-[0.625rem] font-medium text-on-dark">
              غير متوفر
            </span>
          ) : null}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 pe-1">
          <h3 className="truncate text-base font-semibold tracking-tight text-text">
            <Link
              href={`/product/${product.id}`}
              className="hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              {product.name}
            </Link>
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-text-muted">
            {product.description}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <Price
              amount={product.price}
              compareAtAmount={product.oldPrice}
              size="sm"
            />
            {!available ? (
              <span className="text-xs font-medium text-text-subtle">
                غير متوفر
              </span>
            ) : quantity > 0 ? (
              <QuantityStepper
                value={quantity}
                min={0}
                max={99}
                aria-label={`كمية ${product.name}`}
                onChange={(next) => setQuantity(product.id, next)}
                className="h-10"
              />
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                className={cn(
                  "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-on-primary shadow-xs",
                  "transition-colors duration-[var(--duration-fast)]",
                  "hover:bg-brand-primary-hover",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                )}
                aria-label={`إضافة ${product.name} إلى السلة`}
              >
                <Plus
                  className="size-4"
                  strokeWidth={ICON_STROKE.emphasis}
                  aria-hidden
                />
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  const isRail = layout === "rail";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-surface-elevated shadow-xs",
        "motion-lift hover:shadow-sm",
        "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring",
        isRail && "w-[10.5rem] shrink-0 snap-start sm:w-[12rem]",
        layout === "grid" && "w-full",
        !available && "opacity-90",
        className,
      )}
    >
      <Link
        href={`/product/${product.id}`}
        className={cn(
          "relative overflow-hidden bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus-ring",
          isRail ? "aspect-square" : "aspect-[4/3]",
        )}
      >
        {hasImage && product.imageSrc ? (
          <Image
            src={product.imageSrc}
            alt={product.imageAlt ?? product.name}
            fill
            className="object-cover transition-transform duration-[var(--duration-normal)] ease-[var(--ease-standard)] motion-safe:group-hover:scale-[1.02]"
            sizes={isRail ? "192px" : "(max-width:1024px) 50vw, 25vw"}
          />
        ) : (
          <FoodMediaPlaceholder label="صورة الطبق لاحقاً" tone="cream" />
        )}

        {badge ? (
          <div className="absolute start-2 top-2">
            <Badge
              variant={badgeVariant[badge.kind]}
              label={badge.label}
              className="rounded-xl bg-surface-elevated/95"
            >
              {badge.label}
            </Badge>
          </div>
        ) : null}

        {!available ? (
          <span className="absolute inset-x-0 bottom-0 bg-brand-navy/80 px-2 py-1.5 text-center text-xs font-medium text-on-dark">
            غير متوفر حالياً
          </span>
        ) : null}
      </Link>

      <div className="relative flex flex-1 flex-col gap-2 p-3">
        {!isRail ? (
          <DecorativeMotif
            variant="floral-card"
            density="subtle"
            tone="navy"
            className="absolute end-2 top-2 size-3.5 opacity-45"
          />
        ) : null}
        <div className={cn("min-w-0 space-y-0.5", !isRail && "pe-5")}>
          <h3 className="truncate text-sm font-semibold tracking-tight text-text sm:text-base">
            <Link
              href={`/product/${product.id}`}
              className="hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              {product.name}
            </Link>
          </h3>
          {!isRail ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-text-muted">
              {product.description}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Price
            amount={product.price}
            compareAtAmount={product.oldPrice}
            size="sm"
          />

          {!available ? (
            <span className="text-xs font-medium text-text-subtle">
              غير متوفر
            </span>
          ) : quantity > 0 ? (
            <QuantityStepper
              value={quantity}
              min={0}
              max={99}
              aria-label={`كمية ${product.name}`}
              onChange={(next) => setQuantity(product.id, next)}
              className="h-10"
            />
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className={cn(
                "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-on-primary shadow-xs",
                "transition-colors duration-[var(--duration-fast)]",
                "hover:bg-brand-primary-hover",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              )}
              aria-label={`إضافة ${product.name} إلى السلة`}
            >
              <Plus
                className="size-4"
                strokeWidth={ICON_STROKE.emphasis}
                aria-hidden
              />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
