/**
 * Catalog selectors — Customer menu + Admin lists.
 */

import { getCategoryById, listCategories } from "@/features/products/category-repository";
import {
  getProductById,
  listProducts,
} from "@/features/products/product-repository";
import { POPULAR_PRODUCT_IDS } from "@/features/products/seed-catalog";
import type { Category, Product } from "@/types/catalog";

export { getProductById };

export function isProductAvailable(product: Product): boolean {
  return product.available !== false;
}

export function isProductVisible(product: Product): boolean {
  return product.visible !== false;
}

export function isCategoryVisible(category: Category): boolean {
  return category.visible !== false;
}

/** Customer can browse this product in menu / detail. */
export function isProductPubliclyBrowsable(product: Product): boolean {
  if (!isProductVisible(product)) return false;
  const category = getCategoryById(product.categoryId);
  if (!category || !isCategoryVisible(category)) return false;
  return true;
}

export function getVisibleCategories(): Category[] {
  return listCategories().filter(isCategoryVisible);
}

export function getVisibleProducts(): Product[] {
  return listProducts().filter(isProductPubliclyBrowsable);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return listProducts().filter((p) => p.categoryId === categoryId);
}

export function getCategoryProductCount(categoryId: string): number {
  return getProductsByCategory(categoryId).length;
}

export function normalizeArabicSearch(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ");
}

export type ProductListFilter =
  | "all"
  | "available"
  | "unavailable"
  | "visible"
  | "hidden";

export function filterAdminProducts(input: {
  products?: Product[];
  query?: string;
  categoryId?: string | "all";
  status?: ProductListFilter;
}): Product[] {
  const products = input.products ?? listProducts();
  const q = normalizeArabicSearch(input.query ?? "");
  const categoryId = input.categoryId ?? "all";
  const status = input.status ?? "all";

  return products.filter((product) => {
    if (categoryId !== "all" && product.categoryId !== categoryId) {
      return false;
    }
    if (status === "available" && !isProductAvailable(product)) return false;
    if (status === "unavailable" && isProductAvailable(product)) return false;
    if (status === "visible" && !isProductVisible(product)) return false;
    if (status === "hidden" && isProductVisible(product)) return false;

    if (!q) return true;
    const categoryName = getCategoryById(product.categoryId)?.name ?? "";
    const haystack = normalizeArabicSearch(
      `${product.name} ${product.description} ${categoryName}`,
    );
    return haystack.includes(q);
  });
}

/** Customer menu filter: visible products (+ visible categories) only. */
export function filterCustomerMenuProducts(input: {
  query?: string;
  categoryId?: string | "all";
}): Product[] {
  const q = normalizeArabicSearch(input.query ?? "");
  const categoryId = input.categoryId ?? "all";

  return getVisibleProducts().filter((product) => {
    if (categoryId !== "all" && product.categoryId !== categoryId) {
      return false;
    }
    if (!q) return true;
    const categoryName = getCategoryById(product.categoryId)?.name ?? "";
    const haystack = normalizeArabicSearch(
      `${product.name} ${product.description} ${categoryName}`,
    );
    return haystack.includes(q);
  });
}

export function getPopularProducts(): Product[] {
  return POPULAR_PRODUCT_IDS.map((id) => getProductById(id)).filter(
    (p): p is Product =>
      Boolean(
        p && isProductPubliclyBrowsable(p) && isProductAvailable(p),
      ),
  );
}

export function getCategoryName(categoryId: string): string {
  return getCategoryById(categoryId)?.name ?? "—";
}

export type AdminProductListItem = Product & {
  categoryName: string;
};

export function toAdminProductListItem(product: Product): AdminProductListItem {
  return {
    ...product,
    categoryName: getCategoryName(product.categoryId),
  };
}
