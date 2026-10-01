/**
 * In-memory category repository — shared Customer + Admin source.
 */

import { SEED_CATEGORIES } from "@/features/products/seed-catalog";
import { createOpaqueId } from "@/lib/id";
import type {
  Category,
  CategoryAccent,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/types/catalog";

const byId = new Map<string, Category>();
const listeners = new Set<() => void>();
let snapshot: Category[] = [];
let seeded = false;

function rebuild(): void {
  snapshot = Array.from(byId.values()).sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "ar"),
  );
}

function emit(): void {
  rebuild();
  listeners.forEach((l) => l());
}

export function ensureCatalogSeeded(): void {
  if (seeded) return;
  for (const category of SEED_CATEGORIES) {
    byId.set(category.id, { ...category });
  }
  seeded = true;
  rebuild();
}

/** Replace in-memory state from DB hydrate (client cache). */
export function replaceCategoriesFromServer(categories: Category[]): void {
  byId.clear();
  for (const category of categories) {
    byId.set(category.id, { ...category });
  }
  seeded = true;
  emit();
}

/** Upsert one category into the client cache after a DB mutation. */
export function upsertCategoryInCache(category: Category): void {
  byId.set(category.id, { ...category });
  seeded = true;
  emit();
}

export function subscribeCategories(onChange: () => void): () => void {
  ensureCatalogSeeded();
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function getCategoriesSnapshot(): Category[] {
  ensureCatalogSeeded();
  return snapshot;
}

export function listCategories(): Category[] {
  ensureCatalogSeeded();
  return Array.from(byId.values()).sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "ar"),
  );
}

export function getCategoryById(id: string): Category | null {
  ensureCatalogSeeded();
  return byId.get(id) ?? null;
}

function categoryHref(id: string): string {
  return `/menu?category=${id}`;
}

export function createCategory(input: CreateCategoryInput): Category {
  ensureCatalogSeeded();
  const name = input.name.trim();
  if (!name) throw new Error("INVALID_CATEGORY_NAME");

  const now = new Date().toISOString();
  const maxOrder = listCategories().reduce(
    (max, c) => Math.max(max, c.sortOrder),
    0,
  );
  const id = createOpaqueId("cat");
  const accent: CategoryAccent = input.accent ?? "navy";
  const category: Category = {
    id,
    name,
    accent,
    href: categoryHref(id),
    visible: input.visible ?? true,
    sortOrder: input.sortOrder ?? maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };
  byId.set(id, category);
  emit();
  return category;
}

export function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Category {
  ensureCatalogSeeded();
  const existing = byId.get(id);
  if (!existing) throw new Error("CATEGORY_NOT_FOUND");

  const name =
    input.name !== undefined ? input.name.trim() : existing.name;
  if (!name) throw new Error("INVALID_CATEGORY_NAME");

  const next: Category = {
    ...existing,
    name,
    visible: input.visible ?? existing.visible,
    accent: input.accent ?? existing.accent,
    sortOrder: input.sortOrder ?? existing.sortOrder,
    href: categoryHref(id),
    updatedAt: new Date().toISOString(),
  };
  byId.set(id, next);
  emit();
  return next;
}

export function moveCategory(id: string, direction: "up" | "down"): Category {
  ensureCatalogSeeded();
  const ordered = listCategories();
  const index = ordered.findIndex((c) => c.id === id);
  if (index < 0) throw new Error("CATEGORY_NOT_FOUND");
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= ordered.length) {
    return ordered[index]!;
  }

  const a = ordered[index]!;
  const b = ordered[swapWith]!;
  const now = new Date().toISOString();
  byId.set(a.id, { ...a, sortOrder: b.sortOrder, updatedAt: now });
  byId.set(b.id, { ...b, sortOrder: a.sortOrder, updatedAt: now });
  emit();
  return getCategoryById(id)!;
}

export function reorderCategories(orderedIds: string[]): Category[] {
  ensureCatalogSeeded();
  const current = listCategories();
  const currentIds = new Set(current.map((c) => c.id));
  if (
    orderedIds.length !== current.length ||
    orderedIds.some((id) => !currentIds.has(id))
  ) {
    throw new Error("CATEGORY_REORDER_INVALID");
  }
  const now = new Date().toISOString();
  orderedIds.forEach((id, index) => {
    const existing = byId.get(id);
    if (!existing) return;
    byId.set(id, { ...existing, sortOrder: index + 1, updatedAt: now });
  });
  emit();
  return listCategories();
}

export const categoryRepository = {
  list: listCategories,
  getById: getCategoryById,
  create: createCategory,
  update: updateCategory,
  move: moveCategory,
  reorder: reorderCategories,
};
