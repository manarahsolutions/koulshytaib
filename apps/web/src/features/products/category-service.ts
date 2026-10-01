/**
 * Category service — Admin mutations over CategoryRepository.
 */

import {
  createCategory as repoCreateCategory,
  getCategoryById,
  listCategories,
  moveCategory as repoMoveCategory,
  reorderCategories as repoReorderCategories,
  updateCategory as repoUpdateCategory,
} from "@/features/products/category-repository";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/types/catalog";
import type { CatalogResult } from "@/features/products/product-service";

const MESSAGES: Record<string, string> = {
  INVALID_CATEGORY_NAME: "اكتب اسم التصنيف",
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

export function createCategory(
  input: CreateCategoryInput,
): CatalogResult<Category> {
  return wrap(() => repoCreateCategory(input));
}

export function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): CatalogResult<Category> {
  return wrap(() => repoUpdateCategory(id, input));
}

export function setCategoryVisibility(
  id: string,
  visible: boolean,
): CatalogResult<Category> {
  return updateCategory(id, { visible });
}

export function moveCategory(
  id: string,
  direction: "up" | "down",
): CatalogResult<Category> {
  return wrap(() => repoMoveCategory(id, direction));
}

export function reorderCategories(
  orderedIds: string[],
): CatalogResult<Category[]> {
  return wrap(() => repoReorderCategories(orderedIds));
}

export { getCategoryById, listCategories };
