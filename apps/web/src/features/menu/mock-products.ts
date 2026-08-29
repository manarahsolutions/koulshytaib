/**
 * Compatibility facade — Phase 6 menu imports now read the shared catalog.
 * Authoritative source: product/category repositories (seeded once).
 */

import {
  getCategoryById,
  listCategories,
} from "@/features/products/category-repository";
import {
  getProductById,
  listProducts,
} from "@/features/products/product-repository";
import {
  getPopularProducts,
  getVisibleCategories,
  isProductAvailable,
} from "@/features/products/selectors";
import type { Category, Product } from "@/types/catalog";

export function getMenuCategories(): Category[] {
  return listCategories();
}

export function getMenuProducts(): Product[] {
  return listProducts();
}

export function getMockPopularProducts(): Product[] {
  return getPopularProducts();
}

/**
 * Module-level snapshots for generateStaticParams / legacy imports.
 * Runtime UI should use repository getters or use-catalog hooks.
 */
export const MENU_CATEGORIES: Category[] = listCategories();
export const MENU_PRODUCTS: Product[] = listProducts();
export const MOCK_CATEGORIES = MENU_CATEGORIES;
export const MOCK_POPULAR_PRODUCTS: Product[] = getPopularProducts();

export {
  getProductById,
  getCategoryById,
  isProductAvailable,
  getVisibleCategories,
};
