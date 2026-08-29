/**
 * Homepage catalog reads — shared product domain (in-memory).
 */

import {
  getPopularProducts,
  getVisibleCategories,
  isProductAvailable,
} from "@/features/products/selectors";
import { getProductById } from "@/features/products/product-repository";

export {
  getVisibleCategories as getHomeCategories,
  getPopularProducts as getHomePopularProducts,
  isProductAvailable,
  getProductById,
};

/** Eager snapshots for server components (seed catalog at request/build). */
export const MOCK_CATEGORIES = getVisibleCategories();
export const MOCK_POPULAR_PRODUCTS = getPopularProducts();
