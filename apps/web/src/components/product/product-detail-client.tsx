"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { PageContainer } from "@/components/layout/page-container";
import { FoodMediaPlaceholder } from "@/components/product/food-media-placeholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Textarea } from "@/components/ui/textarea";
import {
  selectCartItemQuantity,
  useCartStore,
} from "@/features/cart/cart-store";
import { useCartUiStore } from "@/features/cart/cart-ui-store";
import { getCategoryById } from "@/features/products/category-repository";
import { getProductById } from "@/features/products/product-repository";
import {
  isProductAvailable,
  isProductPubliclyBrowsable,
} from "@/features/products/selectors";
import { useCatalogRevision } from "@/features/products/use-catalog";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";

export function ProductDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  useCatalogRevision();
  const product = getProductById(params.id);
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);
  const openSheet = useCartUiStore((s) => s.openSheet);

  const inCartQty = useCartStore((s) =>
    product ? selectCartItemQuantity(s, product.id) : 0,
  );
  const addItem = useCartStore((s) => s.addItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const updateNotes = useCartStore((s) => s.updateNotes);

  const publiclyBrowsable = product
    ? isProductPubliclyBrowsable(product)
    : false;

  if (!product || !publiclyBrowsable) {
    return (
      <PageContainer width="narrow" className="py-10">
        <h1 className="text-xl font-semibold text-text">ما لكينا هذا المنتج</h1>
        <p className="typo-body-s mt-2 text-text-muted">
          هذا الرابط ما يطابق أي أكلة ظاهرة في المنيو.
        </p>
        <Button className="mt-6" onClick={() => router.push("/menu")}>
          رجوع للمنيو
        </Button>
      </PageContainer>
    );
  }

  const available = isProductAvailable(product);
  const category = getCategoryById(product.categoryId);
  const badge = product.badges?.[0];
  const hasImage = Boolean(product.imageSrc);

  const handleAdd = () => {
    if (!available) return;
    addItem(product.id, qty, notes);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      openSheet();
    }
  };

  return (
    <div className="pb-6">
      <div className="relative mx-auto max-w-[var(--container-max)]">
        <div
          className={cn(
            "relative overflow-hidden bg-surface-warm shadow-sm",
            "rounded-b-3xl sm:mx-4 sm:rounded-3xl lg:mx-8",
          )}
        >
          <div className="relative aspect-[5/4] sm:aspect-[16/10] lg:aspect-[2/1]">
            {hasImage && product.imageSrc ? (
              <Image
                src={product.imageSrc}
                alt={product.imageAlt ?? product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 960px"
              />
            ) : (
              <FoodMediaPlaceholder
                className="min-h-full"
                intent="product"
                label="صورة الطبق لاحقاً"
              />
            )}
            <div
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-brand-navy/25 via-transparent to-brand-navy/10"
              aria-hidden
            />
            <Link
              href="/menu"
              className={cn(
                "absolute start-4 top-4 z-10 inline-flex size-11 items-center justify-center rounded-full",
                "bg-surface-elevated/95 text-text shadow-sm backdrop-blur-sm",
                "hover:bg-surface",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              )}
              aria-label="رجوع للمنيو"
            >
              <ArrowRight
                className="size-5"
                strokeWidth={ICON_STROKE.default}
                aria-hidden
              />
            </Link>
            <DecorativeMotif
              variant="floral-corner"
              density="medium"
              tone="navy"
              className="absolute end-4 top-4 z-10 size-8 text-on-dark/40"
            />
          </div>
        </div>
      </div>

      <PageContainer width="narrow" paddedY={false} className="pt-6 sm:pt-8">
        {category ? (
          <p className="typo-label text-text-muted">{category.name}</p>
        ) : null}

        <div className="mt-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-navy sm:text-[1.85rem]">
              {product.name}
            </h1>
            {badge ? (
              <Badge
                variant="neutral"
                label={badge.label}
                className="rounded-xl"
              >
                {badge.label}
              </Badge>
            ) : null}
          </div>
          <p className="typo-body-s text-pretty text-text-muted sm:text-base">
            {product.description}
          </p>
        </div>

        <div className="mt-4">
          <Price
            amount={product.price}
            compareAtAmount={product.oldPrice}
            size="lg"
          />
        </div>

        {!available ? (
          <p className="mt-5 rounded-2xl border border-border-soft bg-surface-warm px-3 py-2.5 text-sm font-medium text-text">
            غير متوفر حالياً
          </p>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <label htmlFor="product-notes" className="typo-label text-text">
                ملاحظات على الطلب
              </label>
              <Textarea
                id="product-notes"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  if (inCartQty > 0) updateNotes(product.id, e.target.value);
                }}
                placeholder="مثال: بدون بصل، إذا ممكن"
                rows={3}
                className="rounded-2xl"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {inCartQty > 0 ? (
                <QuantityStepper
                  value={inCartQty}
                  min={0}
                  aria-label={`كمية ${product.name} في السلة`}
                  onChange={(next) => setQuantity(product.id, next)}
                />
              ) : (
                <QuantityStepper
                  value={qty}
                  min={1}
                  aria-label={`كمية ${product.name}`}
                  onChange={setQty}
                />
              )}
            </div>

            {inCartQty > 0 ? (
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-2xl"
                onClick={() => {
                  addItem(product.id, 1, notes);
                  if (
                    typeof window !== "undefined" &&
                    window.matchMedia("(max-width: 1023px)").matches
                  ) {
                    openSheet();
                  }
                }}
              >
                زيد للسلة
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleAdd}
                className="h-12 w-full rounded-2xl"
              >
                أضف للسلة
              </Button>
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
