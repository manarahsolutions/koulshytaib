"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FoodMediaPlaceholder } from "@/components/product/food-media-placeholder";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Category, Product } from "@/types/catalog";

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageSrc: string;
  available: boolean;
  visible: boolean;
};

export type ProductFormProps = {
  categories: Category[];
  initial?: Product;
  submitLabel: string;
  onSubmit: (values: {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    imageSrc?: string;
    available: boolean;
    visible: boolean;
  }) => Promise<string | null> | string | null;
};

function toValues(product?: Product): ProductFormValues {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    categoryId: product?.categoryId ?? "",
    imageSrc: product?.imageSrc ?? "",
    available: product?.available ?? true,
    visible: product?.visible ?? true,
  };
}

export function ProductForm({
  categories,
  initial,
  submitLabel,
  onSubmit,
}: ProductFormProps) {
  const formId = useId();
  const [values, setValues] = useState<ProductFormValues>(() =>
    toValues(initial),
  );
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nameId = `${formId}-name`;
  const priceId = `${formId}-price`;
  const categoryId = `${formId}-category`;
  const descriptionId = `${formId}-description`;
  const imageId = `${formId}-image`;

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = "اكتب اسم المنتج";
    const price = Number(values.price);
    if (!values.price.trim() || !Number.isInteger(price) || price <= 0) {
      next.price = "السعر لازم يكون رقم صحيح أكبر من صفر";
    }
    if (!values.categoryId) next.categoryId = "اختَر تصنيفاً";
    else if (!categories.some((c) => c.id === values.categoryId)) {
      next.categoryId = "ما لكينا هذا التصنيف";
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
        name: values.name.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        categoryId: values.categoryId,
        imageSrc: values.imageSrc.trim() || undefined,
        available: values.available,
        visible: values.visible,
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
            <label htmlFor={nameId} className="typo-label text-text">
              الاسم <span className="text-danger">*</span>
            </label>
            <Input
              id={nameId}
              value={values.name}
              onChange={(e) =>
                setValues((v) => ({ ...v, name: e.target.value }))
              }
              invalid={Boolean(errors.name)}
              aria-invalid={Boolean(errors.name) || undefined}
              aria-describedby={errors.name ? `${nameId}-err` : undefined}
              className="mt-1.5"
              autoComplete="off"
            />
            {errors.name ? (
              <p id={`${nameId}-err`} className="mt-1 text-xs text-danger">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor={priceId} className="typo-label text-text">
              السعر (د.ع) <span className="text-danger">*</span>
            </label>
            <Input
              id={priceId}
              inputMode="numeric"
              value={values.price}
              onChange={(e) =>
                setValues((v) => ({ ...v, price: e.target.value }))
              }
              invalid={Boolean(errors.price)}
              aria-invalid={Boolean(errors.price) || undefined}
              aria-describedby={errors.price ? `${priceId}-err` : undefined}
              className="mt-1.5"
              autoComplete="off"
            />
            {errors.price ? (
              <p id={`${priceId}-err`} className="mt-1 text-xs text-danger">
                {errors.price}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor={categoryId} className="typo-label text-text">
              التصنيف <span className="text-danger">*</span>
            </label>
            <Select
              id={categoryId}
              value={values.categoryId}
              onChange={(e) =>
                setValues((v) => ({ ...v, categoryId: e.target.value }))
              }
              invalid={Boolean(errors.categoryId)}
              aria-invalid={Boolean(errors.categoryId) || undefined}
              aria-describedby={
                errors.categoryId ? `${categoryId}-err` : undefined
              }
              className="mt-1.5"
            >
              <option value="">اختَر تصنيفاً</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            {errors.categoryId ? (
              <p id={`${categoryId}-err`} className="mt-1 text-xs text-danger">
                {errors.categoryId}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor={descriptionId} className="typo-label text-text">
              الوصف
            </label>
            <Textarea
              id={descriptionId}
              value={values.description}
              onChange={(e) =>
                setValues((v) => ({ ...v, description: e.target.value }))
              }
              rows={4}
              className="mt-1.5"
            />
          </div>

          <div>
            <label htmlFor={imageId} className="typo-label text-text">
              صورة المنتج (مسار محلي اختياري)
            </label>
            <Input
              id={imageId}
              value={values.imageSrc}
              onChange={(e) =>
                setValues((v) => ({ ...v, imageSrc: e.target.value }))
              }
              placeholder="/images/…"
              className="mt-1.5"
              autoComplete="off"
              dir="ltr"
            />
            <p className="mt-1 text-xs text-text-muted">
              لا يوجد رفع صور حالياً — استخدم مساراً تحت public إن وُجد.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <Checkbox
              id={`${formId}-available`}
              checked={values.available}
              onChange={(e) =>
                setValues((v) => ({ ...v, available: e.target.checked }))
              }
              label="متوفر"
              description="يقدر الزبون يطلبه الآن"
            />
            <Checkbox
              id={`${formId}-visible`}
              checked={values.visible}
              onChange={(e) =>
                setValues((v) => ({ ...v, visible: e.target.checked }))
              }
              label="ظاهر"
              description="يظهر في منيو الزبون"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-elevated p-3">
          <p className="typo-label text-text-muted">معاينة الصورة</p>
          <div className="relative mt-2 aspect-[4/3] overflow-hidden rounded-md border border-border-soft">
            {values.imageSrc.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={values.imageSrc.trim()}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <FoodMediaPlaceholder
                label="لا توجد صورة"
                tone="cream"
                intent="product"
              />
            )}
          </div>
          {!values.imageSrc.trim() ? (
            <p className="mt-2 text-xs text-text-muted">لا توجد صورة</p>
          ) : null}
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
