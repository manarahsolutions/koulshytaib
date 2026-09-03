"use client";

import { ListOrdered, Package, Plus, Tags } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  fetchCatalogAction,
  reorderProductsAction,
  setProductAvailabilityAction,
  setProductVisibilityAction,
} from "@/app/actions/backend";
import { AdminProductReorder } from "@/components/admin/admin-product-reorder";
import { ProductFilters } from "@/components/admin/product-filters";
import { ProductCards, ProductTable } from "@/components/admin/product-list";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  reorderProductsInCategory,
  setProductAvailability,
  setProductVisibility,
} from "@/features/products/product-service";
import { replaceCategoriesFromServer } from "@/features/products/category-repository";
import {
  replaceProductsFromServer,
  upsertProductInCache,
} from "@/features/products/product-repository";
import type { ProductListFilter } from "@/features/products/selectors";
import {
  useAdminProductList,
  useCategories,
  useProducts,
} from "@/features/products/use-catalog";
import { runAdminMutation } from "@/lib/db/run-admin-mutation";
import type { Product } from "@/types/catalog";

async function refreshCatalogCache() {
  const catalog = await fetchCatalogAction();
  if (catalog.ok) {
    replaceCategoriesFromServer(catalog.data.categories);
    replaceProductsFromServer(catalog.data.products);
  }
}

export function AdminProductsClient() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProductListFilter>("all");
  const [categoryId, setCategoryId] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [reorderOpen, setReorderOpen] = useState(false);

  const allProducts = useProducts();
  const categories = useCategories();
  const products = useAdminProductList({ query, categoryId, status });

  const hasFilters =
    query.trim().length > 0 || status !== "all" || categoryId !== "all";

  const clear = () => {
    setQuery("");
    setStatus("all");
    setCategoryId("all");
  };

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const withBusy = async (product: Product, fn: () => Promise<void>) => {
    setBusyId(product.id);
    try {
      await fn();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">المنتجات</h1>
          <p className="mt-1 text-sm text-text-muted">
            إدارة المنتجات الظاهرة في منيو كلشي طيب
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            startIcon={<ListOrdered />}
            onClick={() => setReorderOpen((v) => !v)}
          >
            {reorderOpen ? "إخفاء الترتيب" : "ترتيب القائمة"}
          </Button>
          <Button
            variant="outline"
            startIcon={<Tags />}
            onClick={() => router.push("/admin/products/categories")}
          >
            التصنيفات
          </Button>
          <Button
            startIcon={<Plus />}
            onClick={() => router.push("/admin/products/new")}
          >
            إضافة منتج
          </Button>
        </div>
      </header>

      {toast ? (
        <p
          className="rounded-lg border border-border bg-surface-warm px-3 py-2 text-sm text-text"
          role="status"
        >
          {toast}
        </p>
      ) : null}

      {reorderOpen ? (
        <AdminProductReorder
          categories={categories}
          products={allProducts}
          onClose={() => setReorderOpen(false)}
          onSave={async (catId, orderedIds) => {
            const result = await runAdminMutation({
              db: () => reorderProductsAction(catId, orderedIds),
              memory: () => reorderProductsInCategory(catId, orderedIds),
              onDbSuccess: async () => {
                await refreshCatalogCache();
              },
            });
            flash(result.ok ? "تم حفظ ترتيب المنتجات" : result.message);
            return result.ok;
          }}
        />
      ) : null}

      <ProductFilters
        query={query}
        onQueryChange={setQuery}
        status={status}
        onStatusChange={setStatus}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        categories={categories}
        onClear={clear}
        showClear={hasFilters}
      />

      {products.length === 0 ? (
        <EmptyState
          icon={<Package />}
          title={hasFilters ? "ماكو نتائج" : "ماكو منتجات بعد"}
          description={
            hasFilters
              ? "جرّب تغيير الفلاتر أو امسح البحث."
              : "أضف أول منتج للمنيو."
          }
          action={
            hasFilters ? (
              <Button variant="outline" onClick={clear}>
                مسح الفلاتر
              </Button>
            ) : (
              <Link
                href="/admin/products/new"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 text-sm font-semibold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              >
                <Plus className="size-4" aria-hidden />
                إضافة منتج
              </Link>
            )
          }
        />
      ) : (
        <>
          <ProductTable
            products={products}
            busyId={busyId}
            onToggleAvailable={(product) =>
              void withBusy(product, async () => {
                const result = await runAdminMutation({
                  db: () =>
                    setProductAvailabilityAction(
                      product.id,
                      !product.available,
                    ),
                  memory: () =>
                    setProductAvailability(product.id, !product.available),
                  onDbSuccess: (next) => upsertProductInCache(next),
                });
                flash(result.ok ? "تم تحديث حالة المنتج" : result.message);
              })
            }
            onToggleVisible={(product) =>
              void withBusy(product, async () => {
                const result = await runAdminMutation({
                  db: () =>
                    setProductVisibilityAction(product.id, !product.visible),
                  memory: () =>
                    setProductVisibility(product.id, !product.visible),
                  onDbSuccess: (next) => upsertProductInCache(next),
                });
                flash(result.ok ? "تم تحديث حالة المنتج" : result.message);
              })
            }
          />
          <ProductCards
            products={products}
            busyId={busyId}
            onToggleAvailable={(product) =>
              void withBusy(product, async () => {
                const result = await runAdminMutation({
                  db: () =>
                    setProductAvailabilityAction(
                      product.id,
                      !product.available,
                    ),
                  memory: () =>
                    setProductAvailability(product.id, !product.available),
                  onDbSuccess: (next) => upsertProductInCache(next),
                });
                flash(result.ok ? "تم تحديث حالة المنتج" : result.message);
              })
            }
            onToggleVisible={(product) =>
              void withBusy(product, async () => {
                const result = await runAdminMutation({
                  db: () =>
                    setProductVisibilityAction(product.id, !product.visible),
                  memory: () =>
                    setProductVisibility(product.id, !product.visible),
                  onDbSuccess: (next) => upsertProductInCache(next),
                });
                flash(result.ok ? "تم تحديث حالة المنتج" : result.message);
              })
            }
          />
        </>
      )}
    </div>
  );
}
