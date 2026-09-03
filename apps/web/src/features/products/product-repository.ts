/**
 * In-memory product repository — shared Customer + Admin source.
 */

import {
  ensureCatalogSeeded,
  getCategoryById,
} from "@/features/products/category-repository";
import { SEED_PRODUCTS } from "@/features/products/seed-catalog";
import { createOpaqueId } from "@/lib/id";
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "@/types/catalog";

const byId = new Map<string, Product>();
const listeners = new Set<() => void>();
let snapshot: Product[] = [];
let seeded = false;

function rebuild(): void {
  snapshot = Array.from(byId.values()).sort(
    (a, b) =>
      a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "ar"),
  );
}

function emit(): void {
  rebuild();
  listeners.forEach((l) => l());
}

export function ensureProductCatalogSeeded(): void {
  ensureCatalogSeeded();
  if (seeded) return;
  for (const product of SEED_PRODUCTS) {
    byId.set(product.id, { ...product });
  }
  seeded = true;
  rebuild();
}

/** Replace in-memory state from DB hydrate (client cache). */
export function replaceProductsFromServer(products: Product[]): void {
  byId.clear();
  for (const product of products) {
    byId.set(product.id, { ...product });
  }
  seeded = true;
  emit();
}

/** Upsert one product into the client cache after a DB mutation. */
export function upsertProductInCache(product: Product): void {
  byId.set(product.id, { ...product });
  seeded = true;
  emit();
}

export function subscribeProducts(onChange: () => void): () => void {
  ensureProductCatalogSeeded();
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function getProductsSnapshot(): Product[] {
  ensureProductCatalogSeeded();
  return snapshot;
}

export function listProducts(): Product[] {
  ensureProductCatalogSeeded();
  return Array.from(byId.values()).sort(
    (a, b) =>
      a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "ar"),
  );
}

export function getProductById(id: string): Product | undefined {
  ensureProductCatalogSeeded();
  return byId.get(id);
}

export function createProduct(input: CreateProductInput): Product {
  ensureProductCatalogSeeded();
  const name = input.name.trim();
  if (!name) throw new Error("INVALID_PRODUCT_NAME");
  if (!Number.isInteger(input.price) || input.price <= 0) {
    throw new Error("INVALID_PRODUCT_PRICE");
  }
  if (!getCategoryById(input.categoryId)) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  const now = new Date().toISOString();
  const siblings = listProducts().filter(
    (p) => p.categoryId === input.categoryId,
  );
  const maxOrder = siblings.reduce((max, p) => Math.max(max, p.sortOrder), 0);

  const product: Product = {
    id: createOpaqueId("prod"),
    name,
    description: (input.description ?? "").trim(),
    price: input.price,
    oldPrice: input.oldPrice,
    categoryId: input.categoryId,
    available: input.available ?? true,
    visible: input.visible ?? true,
    sortOrder: input.sortOrder ?? maxOrder + 1,
    imageSrc: input.imageSrc?.trim() || undefined,
    imageAlt: input.imageAlt?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  byId.set(product.id, product);
  emit();
  return product;
}

export function updateProduct(id: string, input: UpdateProductInput): Product {
  ensureProductCatalogSeeded();
  const existing = byId.get(id);
  if (!existing) throw new Error("PRODUCT_NOT_FOUND");

  const name =
    input.name !== undefined ? input.name.trim() : existing.name;
  if (!name) throw new Error("INVALID_PRODUCT_NAME");

  const price = input.price ?? existing.price;
  if (!Number.isInteger(price) || price <= 0) {
    throw new Error("INVALID_PRODUCT_PRICE");
  }

  const categoryId = input.categoryId ?? existing.categoryId;
  if (!getCategoryById(categoryId)) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  const next: Product = {
    ...existing,
    name,
    description:
      input.description !== undefined
        ? input.description.trim()
        : existing.description,
    price,
    oldPrice:
      input.oldPrice !== undefined ? input.oldPrice : existing.oldPrice,
    categoryId,
    available: input.available ?? existing.available,
    visible: input.visible ?? existing.visible,
    sortOrder: input.sortOrder ?? existing.sortOrder,
    imageSrc:
      input.imageSrc !== undefined
        ? input.imageSrc.trim() || undefined
        : existing.imageSrc,
    imageAlt:
      input.imageAlt !== undefined
        ? input.imageAlt.trim() || undefined
        : existing.imageAlt,
    updatedAt: new Date().toISOString(),
  };

  byId.set(id, next);
  emit();
  return next;
}

export function moveProduct(id: string, direction: "up" | "down"): Product {
  ensureProductCatalogSeeded();
  const product = byId.get(id);
  if (!product) throw new Error("PRODUCT_NOT_FOUND");

  const siblings = listProducts().filter(
    (p) => p.categoryId === product.categoryId,
  );
  const index = siblings.findIndex((p) => p.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= siblings.length) {
    return product;
  }

  const a = siblings[index]!;
  const b = siblings[swapWith]!;
  const now = new Date().toISOString();
  byId.set(a.id, { ...a, sortOrder: b.sortOrder, updatedAt: now });
  byId.set(b.id, { ...b, sortOrder: a.sortOrder, updatedAt: now });
  emit();
  return getProductById(id)!;
}

export function reorderProductsInCategory(
  categoryId: string,
  orderedIds: string[],
): Product[] {
  ensureProductCatalogSeeded();
  const siblings = listProducts().filter((p) => p.categoryId === categoryId);
  const siblingIds = new Set(siblings.map((p) => p.id));
  if (
    !orderedIds.length ||
    orderedIds.length !== siblings.length ||
    orderedIds.some((id) => !siblingIds.has(id))
  ) {
    throw new Error("INVALID_PRODUCT_REORDER");
  }
  const now = new Date().toISOString();
  orderedIds.forEach((id, index) => {
    const current = byId.get(id);
    if (!current) throw new Error("PRODUCT_NOT_FOUND");
    byId.set(id, { ...current, sortOrder: index + 1, updatedAt: now });
  });
  emit();
  return listProducts().filter((p) => p.categoryId === categoryId);
}

export const productRepository = {
  list: listProducts,
  getById: getProductById,
  create: createProduct,
  update: updateProduct,
  move: moveProduct,
  reorderInCategory: reorderProductsInCategory,
};
