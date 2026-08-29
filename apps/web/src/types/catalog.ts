/**
 * Domain types for catalog UI + Admin product management.
 * In-memory until a real backend exists.
 */

export type ProductBadgeKind = "popular" | "new" | "discount";

export type ProductBadge = {
  kind: ProductBadgeKind;
  /** Visible label, e.g. "الأكثر طلباً" or "-20%" */
  label: string;
};

export type CategoryAccent =
  | "raspberry"
  | "yellow"
  | "green"
  | "navy"
  | "cream";

export type Category = {
  id: string;
  name: string;
  /** Soft accent key for customer UI chrome */
  accent: CategoryAccent;
  /** Customer menu deep-link */
  href: string;
  /** Show category in customer menu */
  visible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  /** Integer IQD */
  price: number;
  oldPrice?: number;
  /** Public URL path when a real photo exists */
  imageSrc?: string;
  imageAlt?: string;
  badges?: ProductBadge[];
  categoryId: string;
  /** Can the customer order it now? */
  available: boolean;
  /** Should it appear in the customer menu? */
  visible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  available?: boolean;
  visible?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  oldPrice?: number;
  sortOrder?: number;
};

export type UpdateProductInput = Partial<
  Omit<CreateProductInput, "categoryId"> & { categoryId: string }
>;

export type CreateCategoryInput = {
  name: string;
  visible?: boolean;
  accent?: CategoryAccent;
  sortOrder?: number;
};

export type UpdateCategoryInput = Partial<{
  name: string;
  visible: boolean;
  accent: CategoryAccent;
  sortOrder: number;
}>;
