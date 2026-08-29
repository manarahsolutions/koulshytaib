"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getCategoriesSnapshot,
  subscribeCategories,
} from "@/features/products/category-repository";
import {
  getProductsSnapshot,
  subscribeProducts,
} from "@/features/products/product-repository";
import {
  filterAdminProducts,
  filterCustomerMenuProducts,
  getCategoryProductCount,
  getVisibleCategories,
  type ProductListFilter,
} from "@/features/products/selectors";
import type { Category, Product } from "@/types/catalog";

const EMPTY_PRODUCTS: Product[] = [];
const EMPTY_CATEGORIES: Category[] = [];

function subscribeCatalog(onChange: () => void): () => void {
  const unsubP = subscribeProducts(onChange);
  const unsubC = subscribeCategories(onChange);
  return () => {
    unsubP();
    unsubC();
  };
}

function getCatalogRevision(): string {
  const products = getProductsSnapshot();
  const categories = getCategoriesSnapshot();
  return [
    products.map((p) => `${p.id}:${p.updatedAt}`).join("|"),
    categories.map((c) => `${c.id}:${c.updatedAt}:${c.sortOrder}`).join("|"),
  ].join("::");
}

export function useCatalogRevision(): string {
  return useSyncExternalStore(subscribeCatalog, getCatalogRevision, () => "0");
}

export function useProducts(): Product[] {
  return useSyncExternalStore(
    subscribeProducts,
    getProductsSnapshot,
    () => EMPTY_PRODUCTS,
  );
}

export function useCategories(): Category[] {
  return useSyncExternalStore(
    subscribeCategories,
    getCategoriesSnapshot,
    () => EMPTY_CATEGORIES,
  );
}

export function useVisibleCategories(): Category[] {
  const revision = useCatalogRevision();
  return useMemo(
    () => getVisibleCategories(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [revision],
  );
}

export function useCustomerMenuProducts(input: {
  query: string;
  categoryId: string;
}): Product[] {
  const revision = useCatalogRevision();
  return useMemo(
    () =>
      filterCustomerMenuProducts({
        query: input.query,
        categoryId: input.categoryId,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.query, input.categoryId, revision],
  );
}

export function useAdminProductList(input: {
  query: string;
  categoryId: string;
  status: ProductListFilter;
}): Product[] {
  const revision = useCatalogRevision();
  return useMemo(
    () =>
      filterAdminProducts({
        query: input.query,
        categoryId: input.categoryId,
        status: input.status,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.query, input.categoryId, input.status, revision],
  );
}

export type AdminCategoryListItem = Category & { productCount: number };

export function useAdminCategoryList(): AdminCategoryListItem[] {
  const revision = useCatalogRevision();
  const categories = useCategories();
  return useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        productCount: getCategoryProductCount(category.id),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, revision],
  );
}
