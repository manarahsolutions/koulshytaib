/**
 * Product / category services — Admin mutations and shared reads.
 */

import { getCategoryById, listCategories } from "@/features/products/category-repository";
import {
  createProduct as repoCreateProduct,
  getProductById,
  listProducts,
  moveProduct as repoMoveProduct,
  updateProduct as repoUpdateProduct,
} from "@/features/products/product-repository";
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "@/types/catalog";

export type CatalogResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

const MESSAGES: Record<string, string> = {
  INVALID_PRODUCT_NAME: "اكتب اسم المنتج",
  INVALID_PRODUCT_PRICE: "السعر لازم يكون رقم صحيح أكبر من صفر",
  PRODUCT_NOT_FOUND: "ما لكينا هذا المنتج",
  CATEGORY_NOT_FOUND: "ما لكينا هذا التصنيف",
};

function fail(code: string): CatalogResult<never> {
  return {
    ok: false,
    code,
    message: MESSAGES[code] ?? "صار خطأ، حاول مرة ثانية.",
  };
}

function wrap<T>(fn: () => T): CatalogResult<T> {
  try {
    return { ok: true, data: fn() };
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    return fail(code);
  }
}

export function createProduct(
  input: CreateProductInput,
): CatalogResult<Product> {
  return wrap(() => repoCreateProduct(input));
}

export function updateProduct(
  id: string,
  input: UpdateProductInput,
): CatalogResult<Product> {
  return wrap(() => repoUpdateProduct(id, input));
}

export function setProductAvailability(
  id: string,
  available: boolean,
): CatalogResult<Product> {
  return updateProduct(id, { available });
}

export function setProductVisibility(
  id: string,
  visible: boolean,
): CatalogResult<Product> {
  return updateProduct(id, { visible });
}

export function moveProduct(
  id: string,
  direction: "up" | "down",
): CatalogResult<Product> {
  return wrap(() => repoMoveProduct(id, direction));
}

export {
  getProductById,
  listProducts,
  getCategoryById,
  listCategories,
};
