"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/app/actions/backend";
import { ProductForm } from "@/components/admin/product-form";
import { upsertProductInCache } from "@/features/products/product-repository";
import { createProduct } from "@/features/products/product-service";
import { useCategories } from "@/features/products/use-catalog";
import { runAdminMutation } from "@/lib/db/run-admin-mutation";

export function AdminProductNewClient() {
  const router = useRouter();
  const categories = useCategories();

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
        <h1 className="mt-2 text-2xl font-bold text-brand-navy">إضافة منتج</h1>
        <p className="mt-1 text-sm text-text-muted">
          المنتج يظهر في منيو الزبون حسب إعدادات الظهور والتوفر
        </p>
      </div>

      <ProductForm
        categories={categories}
        submitLabel="حفظ المنتج"
        onSubmit={async (values) => {
          const result = await runAdminMutation({
            db: () => createProductAction(values),
            memory: () => createProduct(values),
            onDbSuccess: (product) => upsertProductInCache(product),
          });
          if (!result.ok) return result.message;
          router.push(`/admin/products/${result.data.id}`);
          return null;
        }}
      />
    </div>
  );
}
