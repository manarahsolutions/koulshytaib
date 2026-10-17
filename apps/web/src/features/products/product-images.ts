import type { Product } from "@/types/catalog";

/** All product photos in display order: cover first, then gallery. */
export function getProductImages(product: Product): string[] {
  const images = [product.imageSrc, ...(product.galleryImages ?? [])]
    .map((src) => src?.trim())
    .filter((src): src is string => Boolean(src));
  return Array.from(new Set(images));
}
