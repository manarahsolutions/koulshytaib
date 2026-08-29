/**
 * Server-side catalog/offers reads — DB when configured, else in-memory seed.
 */

import "server-only";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import {
  dbGetCategoryById,
  dbGetProductById,
  dbListCategories,
  dbListProducts,
} from "@/features/products/db-catalog-repository";
import {
  dbGetOfferById,
  dbListOffers,
} from "@/features/offers/db-offer-repository";
import {
  getCategoryById as memGetCategoryById,
  listCategories as memListCategories,
} from "@/features/products/category-repository";
import {
  getProductById as memGetProductById,
  listProducts as memListProducts,
} from "@/features/products/product-repository";
import {
  getOfferById as memGetOfferById,
  listOffers as memListOffers,
} from "@/features/offers/offer-repository";
import type { Category, Product } from "@/types/catalog";
import type { Offer } from "@/features/offers/types";

export async function serverListCategories(): Promise<Category[]> {
  if (isDatabaseConfigured()) return dbListCategories();
  return memListCategories();
}

export async function serverListProducts(): Promise<Product[]> {
  if (isDatabaseConfigured()) return dbListProducts();
  return memListProducts();
}

export async function serverGetProductById(
  id: string,
): Promise<Product | undefined> {
  if (isDatabaseConfigured()) return dbGetProductById(id);
  return memGetProductById(id);
}

export async function serverGetCategoryById(
  id: string,
): Promise<Category | null> {
  if (isDatabaseConfigured()) return dbGetCategoryById(id);
  return memGetCategoryById(id);
}

export async function serverListOffers(): Promise<Offer[]> {
  if (isDatabaseConfigured()) return dbListOffers();
  return memListOffers();
}

export async function serverGetOfferById(
  id: string,
): Promise<Offer | undefined> {
  if (isDatabaseConfigured()) return dbGetOfferById(id);
  return memGetOfferById(id);
}
