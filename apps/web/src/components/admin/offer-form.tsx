"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import { FoodMediaPlaceholder } from "@/components/product/food-media-placeholder";
import { ImageSrcField } from "@/components/admin/image-src-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Offer, OfferType } from "@/features/offers/types";
import { resolveOfferPricing } from "@/features/offers/pricing";
import { formatPriceIQD } from "@/lib/format/price";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/catalog";

export type OfferFormValues = {
  title: string;
  description: string;
  type: OfferType;
  productIds: string[];
  discountPercent: string;
  offerPrice: string;
  originalPrice: string;
  badge: string;
  imageSrc: string;
  ctaLabel: string;
  surface: "cream" | "navy";
  visible: boolean;
  active: boolean;
  featured: boolean;
};

export type OfferFormProps = {
  products: Product[];
  initial?: Offer;
  submitLabel: string;
  onSubmit: (values: {
    title: string;
    description?: string;
    type: OfferType;
    productIds: string[];
    discountPercent?: number;
    offerPrice?: number;
    originalPrice?: number;
    badge?: string;
    imageSrc?: string;
    ctaLabel?: string;
    surface?: "cream" | "navy";
    visible: boolean;
    active: boolean;
    featured: boolean;
  }) => Promise<string | null> | string | null;
};

function toValues(offer?: Offer): OfferFormValues {
  return {
    title: offer?.title ?? "",
    description: offer?.description ?? "",
    type: offer?.type ?? "percentage",
    productIds: offer?.productIds ? [...offer.productIds] : [],
    discountPercent:
      offer?.discountPercent != null ? String(offer.discountPercent) : "20",
    offerPrice: offer?.offerPrice != null ? String(offer.offerPrice) : "",
    originalPrice:
      offer?.originalPrice != null ? String(offer.originalPrice) : "",
    badge: offer?.badge ?? "",
    imageSrc: offer?.imageSrc ?? "",
    ctaLabel: offer?.ctaLabel ?? "اطلب العرض",
    surface: offer?.surface ?? "cream",
    visible: offer?.visible ?? true,
    active: offer?.active ?? true,
    featured: offer?.featured ?? false,
  };
}

export function OfferForm({
  products,
  initial,
  submitLabel,
  onSubmit,
}: OfferFormProps) {
  const formId = useId();
  const [values, setValues] = useState<OfferFormValues>(() => toValues(initial));
  const [errors, setErrors] = useState<
    Partial<Record<keyof OfferFormValues | "products", string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const primaryProduct = useMemo(
    () => products.find((p) => p.id === values.productIds[0]),
    [products, values.productIds],
  );

  const preview = useMemo(() => {
    if (!primaryProduct) return null;
    return resolveOfferPricing(
      {
        type: values.type,
        discountPercent:
          values.type === "percentage"
            ? Number(values.discountPercent)
            : undefined,
        offerPrice:
          values.type === "fixed_price" ? Number(values.offerPrice) : undefined,
        originalPrice: values.originalPrice
          ? Number(values.originalPrice)
          : undefined,
        badge: values.badge,
      },
      primaryProduct.price,
    );
  }, [values, primaryProduct]);

  const toggleProduct = (id: string) => {
    setValues((prev) => {
      if (prev.type === "fixed_price") {
        return { ...prev, productIds: [id] };
      }
      const has = prev.productIds.includes(id);
      return {
        ...prev,
        productIds: has
          ? prev.productIds.filter((x) => x !== id)
          : [...prev.productIds, id],
      };
    });
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!values.title.trim()) next.title = "اكتب عنوان العرض";
    if (values.productIds.length === 0) {
      next.products = "اختار منتج واحد على الأقل";
    }
    if (values.type === "fixed_price") {
      if (values.productIds.length !== 1) {
        next.products = "العرض بسعر ثابت يلزم منتج واحد فقط";
      }
      const price = Number(values.offerPrice);
      if (!values.offerPrice.trim() || !Number.isInteger(price) || price <= 0) {
        next.offerPrice = "سعر العرض لازم يكون رقم صحيح أكبر من صفر";
      }
    } else {
      const percent = Number(values.discountPercent);
      if (
        !values.discountPercent.trim() ||
        !Number.isInteger(percent) ||
        percent <= 0 ||
        percent > 100
      ) {
        next.discountPercent = "النسبة لازم تكون بين 1 و 100";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const message = await onSubmit({
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        type: values.type,
        productIds: values.productIds,
        discountPercent:
          values.type === "percentage"
            ? Number(values.discountPercent)
            : undefined,
        offerPrice:
          values.type === "fixed_price" ? Number(values.offerPrice) : undefined,
        originalPrice:
          values.type === "fixed_price" && values.originalPrice.trim()
            ? Number(values.originalPrice)
            : undefined,
        badge: values.badge.trim() || undefined,
        imageSrc: values.imageSrc.trim() || undefined,
        ctaLabel: values.ctaLabel.trim() || undefined,
        surface: values.surface,
        visible: values.visible,
        active: values.active,
        featured: values.featured,
      });
      if (message) setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="space-y-4">
          <div>
            <label htmlFor={`${formId}-title`} className="typo-label text-text">
              العنوان <span className="text-danger">*</span>
            </label>
            <Input
              id={`${formId}-title`}
              value={values.title}
              onChange={(e) =>
                setValues((v) => ({ ...v, title: e.target.value }))
              }
              invalid={Boolean(errors.title)}
              aria-invalid={Boolean(errors.title) || undefined}
              aria-describedby={
                errors.title ? `${formId}-title-err` : undefined
              }
              className="mt-1.5"
            />
            {errors.title ? (
              <p id={`${formId}-title-err`} className="mt-1 text-xs text-danger">
                {errors.title}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor={`${formId}-type`} className="typo-label text-text">
              نوع العرض <span className="text-danger">*</span>
            </label>
            <Select
              id={`${formId}-type`}
              value={values.type}
              onChange={(e) => {
                const type = e.target.value as OfferType;
                setValues((v) => ({
                  ...v,
                  type,
                  productIds:
                    type === "fixed_price" && v.productIds.length > 1
                      ? v.productIds.slice(0, 1)
                      : v.productIds,
                }));
              }}
              className="mt-1.5"
            >
              <option value="percentage">نسبة مئوية</option>
              <option value="fixed_price">سعر ثابت</option>
            </Select>
          </div>

          {values.type === "percentage" ? (
            <div>
              <label
                htmlFor={`${formId}-percent`}
                className="typo-label text-text"
              >
                نسبة الخصم (%) <span className="text-danger">*</span>
              </label>
              <Input
                id={`${formId}-percent`}
                inputMode="numeric"
                value={values.discountPercent}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    discountPercent: e.target.value,
                  }))
                }
                invalid={Boolean(errors.discountPercent)}
                aria-invalid={Boolean(errors.discountPercent) || undefined}
                aria-describedby={
                  errors.discountPercent
                    ? `${formId}-percent-err`
                    : undefined
                }
                className="mt-1.5"
              />
              {errors.discountPercent ? (
                <p
                  id={`${formId}-percent-err`}
                  className="mt-1 text-xs text-danger"
                >
                  {errors.discountPercent}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`${formId}-offer-price`}
                  className="typo-label text-text"
                >
                  سعر العرض (د.ع) <span className="text-danger">*</span>
                </label>
                <Input
                  id={`${formId}-offer-price`}
                  inputMode="numeric"
                  value={values.offerPrice}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, offerPrice: e.target.value }))
                  }
                  invalid={Boolean(errors.offerPrice)}
                  aria-invalid={Boolean(errors.offerPrice) || undefined}
                  className="mt-1.5"
                />
                {errors.offerPrice ? (
                  <p className="mt-1 text-xs text-danger">{errors.offerPrice}</p>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor={`${formId}-original`}
                  className="typo-label text-text"
                >
                  السعر الأصلي (اختياري)
                </label>
                <Input
                  id={`${formId}-original`}
                  inputMode="numeric"
                  value={values.originalPrice}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      originalPrice: e.target.value,
                    }))
                  }
                  className="mt-1.5"
                />
              </div>
            </div>
          )}

          <fieldset>
            <legend className="typo-label text-text">
              المنتجات <span className="text-danger">*</span>
            </legend>
            <p className="mt-1 text-xs text-text-muted">
              {values.type === "fixed_price"
                ? "اختَر منتجاً واحداً للسعر الثابت."
                : "يمكن اختيار منتج أو أكثر للنسبة المئوية."}
            </p>
            <ul
              className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-2"
              role="group"
              aria-label="اختيار المنتجات"
            >
              {products.map((product) => {
                const checked = values.productIds.includes(product.id);
                return (
                  <li key={product.id}>
                    <label
                      className={cn(
                        "flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 py-1.5",
                        checked ? "bg-surface-warm" : "hover:bg-surface-warm/60",
                      )}
                    >
                      <input
                        type={
                          values.type === "fixed_price" ? "radio" : "checkbox"
                        }
                        name={`${formId}-products`}
                        checked={checked}
                        onChange={() => toggleProduct(product.id)}
                        className="size-4 accent-[var(--color-brand-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-text">
                          {product.name}
                        </span>
                        <span className="block text-xs text-text-muted">
                          {formatPriceIQD(product.price)}
                          {!product.available ? " · غير متوفر" : ""}
                          {!product.visible ? " · مخفي" : ""}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            {errors.products ? (
              <p className="mt-1 text-xs text-danger" role="alert">
                {errors.products}
              </p>
            ) : null}
          </fieldset>

          <div>
            <label htmlFor={`${formId}-desc`} className="typo-label text-text">
              الوصف
            </label>
            <Textarea
              id={`${formId}-desc`}
              value={values.description}
              onChange={(e) =>
                setValues((v) => ({ ...v, description: e.target.value }))
              }
              rows={3}
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`${formId}-badge`}
                className="typo-label text-text"
              >
                شارة العرض
              </label>
              <Input
                id={`${formId}-badge`}
                value={values.badge}
                onChange={(e) =>
                  setValues((v) => ({ ...v, badge: e.target.value }))
                }
                className="mt-1.5"
                placeholder="مثال: خصم 20%"
              />
            </div>
            <div>
              <label htmlFor={`${formId}-cta`} className="typo-label text-text">
                نص الزر
              </label>
              <Input
                id={`${formId}-cta`}
                value={values.ctaLabel}
                onChange={(e) =>
                  setValues((v) => ({ ...v, ctaLabel: e.target.value }))
                }
                className="mt-1.5"
              />
            </div>
          </div>

          <ImageSrcField
            label="صورة العرض"
            inputId={`${formId}-image`}
            value={values.imageSrc}
            onChange={(imageSrc) => setValues((v) => ({ ...v, imageSrc }))}
          />

          <div>
            <label
              htmlFor={`${formId}-surface`}
              className="typo-label text-text"
            >
              سطح البطاقة
            </label>
            <Select
              id={`${formId}-surface`}
              value={values.surface}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  surface: e.target.value as "cream" | "navy",
                }))
              }
              className="mt-1.5"
            >
              <option value="cream">كريمي</option>
              <option value="navy">كحلي</option>
            </Select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
            <Checkbox
              id={`${formId}-active`}
              checked={values.active}
              onChange={(e) =>
                setValues((v) => ({ ...v, active: e.target.checked }))
              }
              label="فعال"
              description="العرض قابل للاستخدام للزبون"
            />
            <Checkbox
              id={`${formId}-visible`}
              checked={values.visible}
              onChange={(e) =>
                setValues((v) => ({ ...v, visible: e.target.checked }))
              }
              label="ظاهر"
              description="يظهر في واجهة الزبون"
            />
            <Checkbox
              id={`${formId}-featured`}
              checked={values.featured}
              onChange={(e) =>
                setValues((v) => ({ ...v, featured: e.target.checked }))
              }
              label="مميز"
              description="عرض رئيسي واحد في الصفحة الرئيسية"
            />
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border bg-surface-elevated p-3">
          <p className="typo-label text-text-muted">معاينة</p>
          <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border-soft">
            {values.imageSrc.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={values.imageSrc.trim()}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <FoodMediaPlaceholder label="لا توجد صورة" tone="cream" />
            )}
          </div>
          {preview ? (
            <div className="text-sm text-text">
              <p className="font-semibold tabular-nums">
                {formatPriceIQD(preview.offerPrice)}
              </p>
              {preview.saving > 0 ? (
                <p className="text-xs text-text-muted">
                  بدل {formatPriceIQD(preview.originalPrice)} · وفّر{" "}
                  {formatPriceIQD(preview.saving)}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-text-muted">
              اختَر منتجاً لعرض السعر المحسوب
            </p>
          )}
          <p className="text-xs text-text-muted">
            الخصم للعرض فقط — ما ينطبق تلقائياً على السلة أو الدفع.
          </p>
        </div>
      </div>

      {formError ? (
        <p className="text-sm text-danger" role="alert">
          {formError}
        </p>
      ) : null}

      <Button type="submit" loading={submitting} disabled={submitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
