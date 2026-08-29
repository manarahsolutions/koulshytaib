/**
 * Map Prisma rows ↔ domain types (UI never imports Prisma models).
 */

import type {
  Category as DbCategory,
  Customer as DbCustomer,
  LoyaltyAccount as DbLoyaltyAccount,
  LoyaltyTransaction as DbLoyaltyTxn,
  Offer as DbOffer,
  Order as DbOrder,
  OrderItem as DbOrderItem,
  OrderStatusHistory as DbHistory,
  Product as DbProduct,
} from "@prisma/client";
import type { Customer } from "@/features/customers/types";
import type {
  LoyaltyAccount,
  LoyaltyTransaction,
  LoyaltyTransactionSource,
} from "@/features/loyalty/types";
import type { Offer } from "@/features/offers/types";
import type { Category, Product, ProductBadge } from "@/types/catalog";
import type {
  Order,
  OrderLineSnapshot,
  OrderStatus,
  OrderStatusEvent,
  PaymentMethodId,
} from "@/types/order";

export function mapCustomer(row: DbCustomer): Customer {
  return {
    id: row.id,
    phone: row.phone,
    name: row.name ?? undefined,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapCategory(row: DbCategory): Category {
  return {
    id: row.id,
    name: row.name,
    accent: row.accent,
    href: row.href,
    visible: row.visible,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapProduct(row: DbProduct): Product {
  const badges = row.badgesJson as ProductBadge[] | null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    oldPrice: row.oldPrice ?? undefined,
    imageSrc: row.imageSrc ?? undefined,
    imageAlt: row.imageAlt ?? undefined,
    badges: badges ?? undefined,
    categoryId: row.categoryId,
    available: row.available,
    visible: row.visible,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapOffer(
  row: DbOffer & { products?: { productId: string }[] },
): Offer {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    productIds: (row.products ?? []).map((p) => p.productId),
    type: row.type,
    discountPercent: row.discountPercent ?? undefined,
    offerPrice: row.offerPrice ?? undefined,
    originalPrice: row.originalPrice ?? undefined,
    visible: row.visible,
    active: row.active,
    featured: row.featured,
    badge: row.badge ?? undefined,
    imageSrc: row.imageSrc ?? undefined,
    ctaLabel: row.ctaLabel,
    surface: row.surface,
    expiresLabel: row.expiresLabel ?? undefined,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapOrderItem(row: DbOrderItem): OrderLineSnapshot {
  return {
    productId: row.productId ?? "",
    name: row.name,
    unitPrice: row.unitPrice,
    quantity: row.quantity,
    lineTotal: row.lineTotal,
    notes: row.notes ?? undefined,
  };
}

export function mapStatusHistory(row: DbHistory): OrderStatusEvent {
  return {
    status: row.status as OrderStatus,
    timestamp: row.createdAt.toISOString(),
    note: row.note ?? undefined,
  };
}

export function mapOrder(
  row: DbOrder & {
    items: DbOrderItem[];
    statusHistory: DbHistory[];
  },
): Order {
  return {
    id: row.id,
    customerId: row.customerId,
    customer: {
      name: row.snapshotName,
      phone: row.snapshotPhone,
    },
    items: row.items.map(mapOrderItem),
    delivery: {
      governorate: row.governorate,
      area: row.area,
      address: row.address,
      landmark: row.landmark ?? undefined,
      notes: row.notes ?? undefined,
    },
    payment: { method: row.paymentMethod as PaymentMethodId },
    pricing: {
      subtotal: row.subtotal,
      deliveryFee: row.deliveryFee,
      total: row.total,
    },
    status: row.status as OrderStatus,
    statusHistory: row.statusHistory
      .slice()
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(mapStatusHistory),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapLoyaltyAccount(row: DbLoyaltyAccount): LoyaltyAccount {
  return {
    customerId: row.customerId,
    pointsBalance: row.pointsBalance,
    lifetimeEarned: row.lifetimeEarned,
    lifetimeRedeemed: row.lifetimeRedeemed,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapLoyaltyTransaction(
  row: DbLoyaltyTxn,
): LoyaltyTransaction {
  let source: LoyaltyTransactionSource | undefined;
  if (row.sourceType === "order" && row.sourceId) {
    source = { type: "order", id: row.sourceId };
  } else if (row.sourceType === "reward" && row.sourceId) {
    source = { type: "reward", id: row.sourceId };
  } else if (row.sourceType === "manual") {
    source = { type: "manual", id: row.sourceId ?? undefined };
  }

  return {
    id: row.id,
    customerId: row.customerId,
    type: row.type,
    points: row.points,
    reason: row.reason,
    createdAt: row.createdAt.toISOString(),
    source,
    relatedOrderId: row.relatedOrderId ?? undefined,
  };
}
