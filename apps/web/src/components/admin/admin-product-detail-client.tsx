"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { updateProductAction } from "@/app/actions/backend";
import {
  AvailabilityBadge,
  VisibilityBadge,
} from "@/components/admin/product-status-badges";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getProductById,
  upsertProductInCache,
} from "@/features/products/product-repository";
import { updateProduct } from "@/features/products/product-service";
import { getCategoryName } from "@/features/products/selectors";
import {
  useCatalogRevision,
  useCategories,
} from "@/features/products/use-catalog";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { runAdminMutation } from "@/lib/db/run-admin-mutation";
import { formatPriceIQD } from "@/lib/format/price";

export function AdminProductDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  useCatalogRevision();
  const categories = useCategories();
  const product = getProductById(params.id);
  const [toast, setToast] = useState<string | null>(null);

  if (!product) {
    return (
      <EmptyState
        title="ما لكينا هذا المنتج"
        description="قد يكون المعرّف غير صحيح أو البيانات أُعيد ضبطها بعد تحديث الصفحة."
        action={
          <Button onClick={() => router.push("/admin/products")}>
            رجوع للمنتجات
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex h-11 items-center gap-2 text-sm font-medium text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          <ArrowRight className="size-4" aria-hidden />
          رجوع للمنتجات
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-navy">
          تعديل منتج
        </h1>
        <p className="mt-1 text-sm text-text-muted">{product.name}</p>
      </div>

      <section
        aria-label="ملخص المنتج"
        className="grid gap-3 rounded-lg border border-border bg-surface-elevated p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <p className="typo-caption text-text-muted">التصنيف</p>
          <p className="mt-1 text-sm font-medium text-text">
            {getCategoryName(product.categoryId)}
          </p>
        </div>
        <div>
          <p className="typo-caption text-text-muted">السعر</p>
          <p className="mt-1 text-sm font-medium tabular-nums text-text">
            {formatPriceIQD(product.price)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AvailabilityBadge available={product.available} />
          <VisibilityBadge visible={product.visible} />
        </div>
        <div>
          <p className="typo-caption text-text-muted">التواريخ</p>
          <p className="mt-1 text-xs text-text-muted">
            أُنشئ {formatIraqDateTime(product.createdAt)}
          </p>
          <p className="text-xs text-text-muted">
            حُدّث {formatIraqDateTime(product.updatedAt)}
          </p>
        </div>
      </section>

      {toast ? (
        <p
          className="rounded-md border border-success/25 bg-success-subtle px-3 py-2 text-sm text-success"
          role="status"
          aria-live="polite"
        >
          {toast}
        </p>
      ) : null}

      <ProductForm
        key={product.updatedAt}
        categories={categories}
        initial={product}
        submitLabel="حفظ التعديلات"
        onSubmit={async (values) => {
          const result = await runAdminMutation({
            db: () => updateProductAction(product.id, values),
            memory: () => updateProduct(product.id, values),
            onDbSuccess: (next) => upsertProductInCache(next),
          });
          if (!result.ok) return result.message;
          setToast("تم حفظ التعديلات");
          window.setTimeout(() => setToast(null), 2200);
          return null;
        }}
      />
    </div>
  );
}
