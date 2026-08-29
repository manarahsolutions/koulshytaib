/**
 * CRM / customer identity types.
 * Phone-first guest identity — no login accounts.
 */

export type CustomerStatus = "active" | "inactive";

/** Derived / future admin labels — not an automated segmentation engine. */
export type CustomerTag =
  | "new"
  | "returning"
  | "high_value"
  | "frequent"
  | "inactive";

export type CustomerActivityType =
  | "order_created"
  | "order_confirmed"
  | "order_delivered"
  | "order_cancelled"
  | "points_earned"
  | "points_redeemed";

export type Customer = {
  /** Opaque internal id — never use phone as the primary key */
  id: string;
  /** Normalized unique Iraqi mobile: 07XXXXXXXXX */
  phone: string;
  /** Canonical display name — first checkout wins until Admin updates */
  name?: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomerInput = {
  phone: string;
  name?: string;
};

export type UpdateCustomerInput = {
  name?: string;
  status?: CustomerStatus;
};

export type CustomerActivity = {
  id: string;
  customerId: string;
  type: CustomerActivityType;
  /** ISO timestamp */
  createdAt: string;
  /** Optional opaque related entity id (order, loyalty txn, …) */
  relatedId?: string;
  note?: string;
};

export type CustomerClassification = "new" | "returning";

export type CustomerMetrics = {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  /** Spend from delivered orders only (IQD) */
  totalSpend: number;
  /** Alias of totalSpend — lifetime value from completed deliveries */
  lifetimeValue: number;
  averageOrderValue: number;
  firstOrderAt: string | null;
  /** Most recent order of any status */
  lastOrderAt: string | null;
  /** Most recent delivered order — CRM “آخر طلب مكتمل” */
  lastDeliveredAt: string | null;
  classification: CustomerClassification;
  favoriteProductIds: string[];
  favoriteCategoryIds: string[];
};

export type CustomerRepository = {
  findByPhone: (phone: string) => Customer | null;
  findById: (id: string) => Customer | null;
  create: (input: CreateCustomerInput) => Customer;
  update: (id: string, input: UpdateCustomerInput) => Customer;
  list: () => Customer[];
  search: (query: string) => Customer[];
};
