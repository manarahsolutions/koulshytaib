/**
 * PostgreSQL-backed category + product persistence (server-only).
 */

import "server-only";
import { prisma } from "@/lib/db/prisma";
import { mapCategory, mapProduct } from "@/lib/db/mappers";
import { BackendError } from "@/lib/db/errors";
import { createOpaqueId } from "@/lib/id";
import type {
  Category,
  CreateCategoryInput,
  CreateProductInput,
  Product,
  ProductOptionGroupDraft,
  UpdateCategoryInput,
  UpdateProductInput,
} from "@/types/catalog";

const productOptionsInclude = {
  optionGroups: {
    include: { options: true },
    orderBy: [{ sortOrder: "asc" as const }, { name: "asc" as const }],
  },
};

async function replaceProductOptionGroups(
  productId: string,
  drafts: ProductOptionGroupDraft[] | undefined,
): Promise<void> {
  await prisma.productOptionGroup.deleteMany({ where: { productId } });
  if (!drafts?.length) return;

  for (const [gIndex, group] of drafts.entries()) {
    const name = group.name.trim();
    if (!name) continue;
    const options = group.options
      .map((o, oIndex) => ({
        name: o.name.trim(),
        priceDelta: Math.trunc(o.priceDelta),
        available: o.available,
        sortOrder: o.sortOrder ?? oIndex + 1,
      }))
      .filter((o) => o.name.length > 0);
    if (!options.length) continue;

    await prisma.productOptionGroup.create({
      data: {
        id: createOpaqueId("pog"),
        productId,
        name,
        selection: group.selection === "MULTI" ? "MULTI" : "SINGLE",
        required: Boolean(group.required),
        minSelect: group.minSelect ?? null,
        maxSelect: group.maxSelect ?? null,
        sortOrder: group.sortOrder ?? gIndex + 1,
        options: {
          create: options.map((o) => ({
            id: createOpaqueId("po"),
            name: o.name,
            priceDelta: o.priceDelta,
            available: o.available,
            sortOrder: o.sortOrder,
          })),
        },
      },
    });
  }
}

function categoryHref(id: string): string {
  return `/menu?category=${id}`;
}

export async function dbListCategories(): Promise<Category[]> {
  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(mapCategory);
}

export async function dbGetCategoryById(id: string): Promise<Category | null> {
  const row = await prisma.category.findUnique({ where: { id } });
  return row ? mapCategory(row) : null;
}

export async function dbCreateCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  const name = input.name.trim();
  if (!name) throw new BackendError("VALIDATION", "اكتب اسم التصنيف");

  const max = await prisma.category.aggregate({ _max: { sortOrder: true } });
  const id = createOpaqueId("cat");
  const row = await prisma.category.create({
    data: {
      id,
      name,
      accent: input.accent ?? "navy",
      href: categoryHref(id),
      visible: input.visible ?? true,
      sortOrder: input.sortOrder ?? (max._max.sortOrder ?? 0) + 1,
    },
  });
  return mapCategory(row);
}

export async function dbUpdateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<Category> {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new BackendError("NOT_FOUND", "ما لكينا هذا التصنيف");
  }
  const name =
    input.name !== undefined ? input.name.trim() : existing.name;
  if (!name) throw new BackendError("VALIDATION", "اكتب اسم التصنيف");

  const row = await prisma.category.update({
    where: { id },
    data: {
      name,
      visible: input.visible ?? existing.visible,
      accent: input.accent ?? existing.accent,
      sortOrder: input.sortOrder ?? existing.sortOrder,
      href: categoryHref(id),
    },
  });
  return mapCategory(row);
}

export async function dbMoveCategory(
  id: string,
  direction: "up" | "down",
): Promise<Category> {
  const ordered = await dbListCategories();
  const index = ordered.findIndex((c) => c.id === id);
  if (index < 0) {
    throw new BackendError("NOT_FOUND", "ما لكينا هذا التصنيف");
  }
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= ordered.length) {
    return ordered[index]!;
  }
  const a = ordered[index]!;
  const b = ordered[swapWith]!;
  await prisma.$transaction([
    prisma.category.update({
      where: { id: a.id },
      data: { sortOrder: b.sortOrder },
    }),
    prisma.category.update({
      where: { id: b.id },
      data: { sortOrder: a.sortOrder },
    }),
  ]);
  return (await dbGetCategoryById(id))!;
}

/** Rewrite sortOrder for all categories (1-based display order). */
export async function dbReorderCategories(
  orderedIds: string[],
): Promise<Category[]> {
  if (!orderedIds.length) {
    throw new BackendError("VALIDATION", "قائمة الترتيب فارغة");
  }
  const current = await dbListCategories();
  const currentIds = new Set(current.map((c) => c.id));
  if (
    orderedIds.length !== current.length ||
    orderedIds.some((id) => !currentIds.has(id))
  ) {
    throw new BackendError(
      "VALIDATION",
      "ترتيب التصنيفات غير مكتمل — حدّث الصفحة وحاول مرة ثانية",
    );
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { sortOrder: index + 1 },
      }),
    ),
  );

  return dbListCategories();
}

export async function dbListProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    include: productOptionsInclude,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(mapProduct);
}

export async function dbGetProductById(id: string): Promise<Product | undefined> {
  const row = await prisma.product.findUnique({
    where: { id },
    include: productOptionsInclude,
  });
  return row ? mapProduct(row) : undefined;
}

export async function dbCreateProduct(
  input: CreateProductInput,
): Promise<Product> {
  const name = input.name.trim();
  if (!name) throw new BackendError("VALIDATION", "اكتب اسم المنتج");
  if (!Number.isInteger(input.price) || input.price <= 0) {
    throw new BackendError(
      "VALIDATION",
      "السعر لازم يكون رقم صحيح أكبر من صفر",
    );
  }
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
  });
  if (!category) {
    throw new BackendError("NOT_FOUND", "ما لكينا هذا التصنيف");
  }

  const siblings = await prisma.product.findMany({
    where: { categoryId: input.categoryId },
    select: { sortOrder: true },
  });
  const maxOrder = siblings.reduce((m, p) => Math.max(m, p.sortOrder), 0);

  const row = await prisma.product.create({
    data: {
      id: createOpaqueId("prod"),
      name,
      description: (input.description ?? "").trim(),
      price: input.price,
      oldPrice: input.oldPrice ?? null,
      categoryId: input.categoryId,
      available: input.available ?? true,
      visible: input.visible ?? true,
      sortOrder: input.sortOrder ?? maxOrder + 1,
      imageSrc: input.imageSrc?.trim() || null,
      imageAlt: input.imageAlt?.trim() || null,
    },
  });
  await replaceProductOptionGroups(row.id, input.optionGroups);
  return (await dbGetProductById(row.id))!;
}

export async function dbUpdateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<Product> {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new BackendError("NOT_FOUND", "ما لكينا هذا المنتج");
  }

  const name =
    input.name !== undefined ? input.name.trim() : existing.name;
  if (!name) throw new BackendError("VALIDATION", "اكتب اسم المنتج");

  const price = input.price ?? existing.price;
  if (!Number.isInteger(price) || price <= 0) {
    throw new BackendError(
      "VALIDATION",
      "السعر لازم يكون رقم صحيح أكبر من صفر",
    );
  }

  const categoryId = input.categoryId ?? existing.categoryId;
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    throw new BackendError("NOT_FOUND", "ما لكينا هذا التصنيف");
  }

  const row = await prisma.product.update({
    where: { id },
    data: {
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
          ? input.imageSrc.trim() || null
          : existing.imageSrc,
      imageAlt:
        input.imageAlt !== undefined
          ? input.imageAlt.trim() || null
          : existing.imageAlt,
    },
  });
  if (input.optionGroups !== undefined) {
    await replaceProductOptionGroups(id, input.optionGroups);
  }
  return (await dbGetProductById(row.id))!;
}

export async function dbMoveProduct(
  id: string,
  direction: "up" | "down",
): Promise<Product> {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new BackendError("NOT_FOUND", "ما لكينا هذا المنتج");
  }
  const siblings = await prisma.product.findMany({
    where: { categoryId: product.categoryId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const index = siblings.findIndex((p) => p.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= siblings.length) {
    return mapProduct(product);
  }
  const a = siblings[index]!;
  const b = siblings[swapWith]!;
  await prisma.$transaction([
    prisma.product.update({
      where: { id: a.id },
      data: { sortOrder: b.sortOrder },
    }),
    prisma.product.update({
      where: { id: b.id },
      data: { sortOrder: a.sortOrder },
    }),
  ]);
  return (await dbGetProductById(id))!;
}

/** Rewrite sortOrder for all products in a category (1-based display order). */
export async function dbReorderProductsInCategory(
  categoryId: string,
  orderedIds: string[],
): Promise<Product[]> {
  if (!orderedIds.length) {
    throw new BackendError("VALIDATION", "قائمة الترتيب فارغة");
  }
  const siblings = await prisma.product.findMany({
    where: { categoryId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const siblingIds = new Set(siblings.map((p) => p.id));
  if (
    orderedIds.length !== siblings.length ||
    orderedIds.some((id) => !siblingIds.has(id))
  ) {
    throw new BackendError(
      "VALIDATION",
      "ترتيب المنتجات غير مكتمل — حدّث الصفحة وحاول مرة ثانية",
    );
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.product.update({
        where: { id },
        data: { sortOrder: index + 1 },
      }),
    ),
  );

  return dbListProducts().then((all) =>
    all.filter((p) => p.categoryId === categoryId),
  );
}
