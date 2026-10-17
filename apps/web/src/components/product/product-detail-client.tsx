"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { PageContainer } from "@/components/layout/page-container";
import { FoodMediaPlaceholder } from "@/components/product/food-media-placeholder";
import { ProductGallery } from "@/components/product/product-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/features/cart/cart-store";
import { useCartUiStore } from "@/features/cart/cart-ui-store";
import { getCategoryById } from "@/features/products/category-repository";
import {
  configuredUnitPrice,
  productHasOptions,
  resolveAndValidateSelections,
} from "@/features/products/product-options";
import { getProductImages } from "@/features/products/product-images";
import { getProductById } from "@/features/products/product-repository";
import {
  isProductAvailable,
  isProductPubliclyBrowsable,
} from "@/features/products/selectors";
import { useCatalogRevision } from "@/features/products/use-catalog";
import { formatPriceIQD } from "@/lib/format/price";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";

export function ProductDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  useCatalogRevision();
  const product = getProductById(params.id);
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [optionError, setOptionError] = useState<string | null>(null);
  const openSheet = useCartUiStore((s) => s.openSheet);
  const addItem = useCartStore((s) => s.addItem);

  const publiclyBrowsable = product
    ? isProductPubliclyBrowsable(product)
    : false;

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    const validated = resolveAndValidateSelections(product, selectedIds);
    if (!validated.ok) {
      return configuredUnitPrice(
        product.price,
        // partial preview: only include known selected options
        (product.optionGroups ?? [])
          .flatMap((g) => g.options)
          .filter((o) => selectedIds.includes(o.id))
          .map((o) => {
            const group = product.optionGroups!.find((g) => g.id === o.groupId)!;
            return {
              optionId: o.id,
              groupId: o.groupId,
              groupName: group.name,
              optionName: o.name,
              priceDelta: o.priceDelta,
            };
          }),
      );
    }
    return configuredUnitPrice(product.price, validated.selections);
  }, [product, selectedIds]);

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
  const images = getProductImages(product);
  const groups = product.optionGroups ?? [];
  const hasOptions = productHasOptions(product);

  const toggleSingle = (groupId: string, optionId: string) => {
    setOptionError(null);
    setSelectedIds((prev) => {
      const withoutGroup = prev.filter((id) => {
        const opt = groups
          .flatMap((g) => g.options.map((o) => ({ ...o, groupId: g.id })))
          .find((o) => o.id === id);
        return opt?.groupId !== groupId;
      });
      return [...withoutGroup, optionId];
    });
  };

  const toggleMulti = (optionId: string) => {
    setOptionError(null);
    setSelectedIds((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    );
  };

  const handleAdd = () => {
    if (!available) return;
    const validated = resolveAndValidateSelections(product, selectedIds);
    if (!validated.ok) {
      setOptionError(validated.message);
      return;
    }
    addItem(product.id, qty, notes, validated.selections);
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches
    ) {
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
            {images.length > 0 ? (
              <ProductGallery
                images={images}
                alt={product.imageAlt ?? product.name}
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
          <Price amount={unitPrice} compareAtAmount={product.oldPrice} size="lg" />
          {hasOptions && unitPrice !== product.price ? (
            <p className="typo-caption mt-1 text-text-muted">
              الأساسي {formatPriceIQD(product.price)} + الخيارات
            </p>
          ) : null}
        </div>

        {!available ? (
          <p className="mt-5 rounded-2xl border border-border-soft bg-surface-warm px-3 py-2.5 text-sm font-medium text-text">
            غير متوفر حالياً
          </p>
        ) : (
          <div className="mt-6 space-y-5">
            {groups.map((group) => {
              const availableOptions = group.options.filter((o) => o.available);
              if (!availableOptions.length) return null;
              return (
                <fieldset key={group.id} className="space-y-2">
                  <legend className="typo-label text-text">
                    {group.name}
                    {group.required ? (
                      <span className="text-danger"> *</span>
                    ) : null}
                  </legend>
                  <div className="space-y-2">
                    {availableOptions.map((option) => {
                      const checked = selectedIds.includes(option.id);
                      const deltaLabel =
                        option.priceDelta === 0
                          ? null
                          : option.priceDelta > 0
                            ? `+${formatPriceIQD(option.priceDelta)}`
                            : formatPriceIQD(option.priceDelta);
                      if (group.selection === "SINGLE") {
                        return (
                          <label
                            key={option.id}
                            className={cn(
                              "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-sm",
                              checked
                                ? "border-brand-primary bg-brand-primary/5"
                                : "border-border-soft bg-surface-elevated",
                            )}
                          >
                            <span className="flex items-center gap-2">
                              <input
                                type="radio"
                                className="size-4 accent-[var(--color-brand-primary)]"
                                name={`group-${group.id}`}
                                checked={checked}
                                onChange={() =>
                                  toggleSingle(group.id, option.id)
                                }
                              />
                              {option.name}
                            </span>
                            {deltaLabel ? (
                              <span className="tabular-nums text-text-muted">
                                {deltaLabel}
                              </span>
                            ) : null}
                          </label>
                        );
                      }
                      return (
                        <div
                          key={option.id}
                          className={cn(
                            "flex items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-sm",
                            checked
                              ? "border-brand-primary bg-brand-primary/5"
                              : "border-border-soft bg-surface-elevated",
                          )}
                        >
                          <Checkbox
                            id={`opt-${option.id}`}
                            checked={checked}
                            onChange={() => toggleMulti(option.id)}
                            label={option.name}
                          />
                          {deltaLabel ? (
                            <span className="tabular-nums text-text-muted">
                              {deltaLabel}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}

            <div className="space-y-2">
              <label htmlFor="product-notes" className="typo-label text-text">
                ملاحظات على الطلب
              </label>
              <Textarea
                id="product-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: بدون بصل، إذا ممكن"
                rows={3}
                className="rounded-2xl"
              />
            </div>

            <QuantityStepper
              value={qty}
              min={1}
              aria-label={`كمية ${product.name}`}
              onChange={setQty}
            />

            {optionError ? (
              <p className="text-sm text-danger" role="alert">
                {optionError}
              </p>
            ) : null}

            <Button
              type="button"
              onClick={handleAdd}
              className="h-12 w-full rounded-2xl"
            >
              أضف للسلة · {formatPriceIQD(unitPrice * qty)}
            </Button>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
