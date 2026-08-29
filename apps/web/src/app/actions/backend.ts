/**
 * Server actions — DB-backed mutations/reads for Client Components.
 * Never import Prisma into the browser.
 */

"use server";

import { revalidatePath } from "next/cache";
import {
  dbCreateCategory,
  dbCreateProduct,
  dbListCategories,
  dbListProducts,
  dbMoveCategory,
  dbMoveProduct,
  dbUpdateCategory,
  dbUpdateProduct,
} from "@/features/products/db-catalog-repository";
import {
  dbCreateOffer,
  dbGetOfferById,
  dbListOffers,
  dbMoveOffer,
  dbUpdateOffer,
} from "@/features/offers/db-offer-repository";
import {
  dbFindCustomerById,
  dbListCustomers,
  dbRecordActivity,
  dbSearchCustomers,
  dbUpdateCustomer,
} from "@/features/customers/db-customer-repository";
import {
  dbGetOrderById,
  dbListOrders,
  dbListOrdersByCustomerId,
  dbUpdateOrderStatus,
} from "@/features/orders/db-order-repository";
import { dbPlaceGuestOrderAtomic } from "@/features/orders/db-guest-checkout";
import {
  dbGetLoyaltyAccount,
  dbGetLoyaltyConfig,
  dbListAllLoyaltyTransactions,
  dbListLoyaltyAccounts,
  dbListLoyaltyTransactions,
} from "@/features/loyalty/db-loyalty-repository";
import {
  dbListNotificationsForOrder,
  enqueueAndDispatchOrderStatusNotification,
} from "@/features/notifications/notification-service";
import { DELIVERY_FEE_IQD } from "@/features/checkout/pricing";
import { requireAdmin } from "@/features/admin-auth/authorization";
import { AuthError } from "@/features/admin-auth/types";
import { BackendError, logServerError, toUserMessage } from "@/lib/db/errors";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import type {
  CreateCategoryInput,
  CreateProductInput,
  UpdateCategoryInput,
  UpdateProductInput,
} from "@/types/catalog";
import type { CreateOfferInput, UpdateOfferInput } from "@/features/offers/types";
import type { Order, OrderStatus, PaymentMethodId } from "@/types/order";
import type { NotificationRecord } from "@/features/notifications/types";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

function fail(error: unknown, context: string): ActionResult<never> {
  if (error instanceof AuthError) {
    return { ok: false, message: error.userMessage };
  }
  logServerError(context, error);
  return { ok: false, message: toUserMessage(error) };
}

function requireDb(): void {
  if (!isDatabaseConfigured()) {
    throw new BackendError(
      "DATABASE_UNAVAILABLE",
      "قاعدة البيانات غير مهيأة حالياً",
    );
  }
}

/** Admin-only: DB must be up and session must be valid. */
async function requireAdminDb(): Promise<void> {
  requireDb();
  await requireAdmin();
}

/* ─── Catalog reads ─────────────────────────────────────────── */

export async function fetchCatalogAction() {
  try {
    requireDb();
    const [categories, products] = await Promise.all([
      dbListCategories(),
      dbListProducts(),
    ]);
    return { ok: true as const, data: { categories, products } };
  } catch (error) {
    return fail(error, "fetchCatalog");
  }
}

export async function fetchOffersAction() {
  try {
    requireDb();
    return { ok: true as const, data: await dbListOffers() };
  } catch (error) {
    return fail(error, "fetchOffers");
  }
}

/* ─── Catalog mutations (Admin) ─────────────────────────────── */

export async function createProductAction(
  input: CreateProductInput,
): Promise<ActionResult<Awaited<ReturnType<typeof dbCreateProduct>>>> {
  try {
    await requireAdminDb();
    const data = await dbCreateProduct(input);
    revalidatePath("/admin/products");
    revalidatePath("/menu");
    revalidatePath("/");
    return { ok: true, data };
  } catch (error) {
    return fail(error, "createProduct");
  }
}

export async function updateProductAction(
  id: string,
  input: UpdateProductInput,
) {
  try {
    await requireAdminDb();
    const data = await dbUpdateProduct(id, input);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/menu");
    revalidatePath("/");
    return { ok: true as const, data };
  } catch (error) {
    return fail(error, "updateProduct");
  }
}

export async function setProductAvailabilityAction(
  id: string,
  available: boolean,
) {
  return updateProductAction(id, { available });
}

export async function setProductVisibilityAction(
  id: string,
  visible: boolean,
) {
  return updateProductAction(id, { visible });
}

export async function moveProductAction(
  id: string,
  direction: "up" | "down",
) {
  try {
    await requireAdminDb();
    const data = await dbMoveProduct(id, direction);
    revalidatePath("/admin/products");
    return { ok: true as const, data };
  } catch (error) {
    return fail(error, "moveProduct");
  }
}

export async function createCategoryAction(input: CreateCategoryInput) {
  try {
    await requireAdminDb();
    const data = await dbCreateCategory(input);
    revalidatePath("/admin/products/categories");
    revalidatePath("/menu");
    revalidatePath("/");
    return { ok: true as const, data };
  } catch (error) {
    return fail(error, "createCategory");
  }
}

export async function updateCategoryAction(
  id: string,
  input: UpdateCategoryInput,
) {
  try {
    await requireAdminDb();
    const data = await dbUpdateCategory(id, input);
    revalidatePath("/admin/products/categories");
    revalidatePath("/menu");
    revalidatePath("/");
    return { ok: true as const, data };
  } catch (error) {
    return fail(error, "updateCategory");
  }
}

export async function setCategoryVisibilityAction(
  id: string,
  visible: boolean,
) {
  return updateCategoryAction(id, { visible });
}

export async function moveCategoryAction(
  id: string,
  direction: "up" | "down",
) {
  try {
    await requireAdminDb();
    const data = await dbMoveCategory(id, direction);
    revalidatePath("/admin/products/categories");
    revalidatePath("/");
    return { ok: true as const, data };
  } catch (error) {
    return fail(error, "moveCategory");
  }
}

/* ─── Offers (Admin mutations) ──────────────────────────────── */

export async function createOfferAction(input: CreateOfferInput) {
  try {
    await requireAdminDb();
    const data = await dbCreateOffer(input);
    revalidatePath("/admin/offers");
    revalidatePath("/");
    revalidatePath("/offers");
    return { ok: true as const, data };
  } catch (error) {
    return fail(error, "createOffer");
  }
}

export async function updateOfferAction(id: string, input: UpdateOfferInput) {
  try {
    await requireAdminDb();
    const data = await dbUpdateOffer(id, input);
    revalidatePath("/admin/offers");
    revalidatePath(`/admin/offers/${id}`);
    revalidatePath("/");
    revalidatePath("/offers");
    return { ok: true as const, data };
  } catch (error) {
    return fail(error, "updateOffer");
  }
}

export async function setOfferActiveAction(id: string, active: boolean) {
  return updateOfferAction(id, { active });
}

export async function setOfferVisibilityAction(id: string, visible: boolean) {
  return updateOfferAction(id, { visible });
}

export async function setOfferFeaturedAction(id: string, featured: boolean) {
  return updateOfferAction(id, { featured });
}

export async function moveOfferAction(id: string, direction: "up" | "down") {
  try {
    await requireAdminDb();
    const data = await dbMoveOffer(id, direction);
    revalidatePath("/admin/offers");
    return { ok: true as const, data };
  } catch (error) {
    return fail(error, "moveOffer");
  }
}

export async function getOfferAction(id: string) {
  try {
    await requireAdminDb();
    const data = await dbGetOfferById(id);
    if (!data) {
      return { ok: false as const, message: "ما لكينا هذا العرض" };
    }
    return { ok: true as const, data };
  } catch (error) {
    return fail(error, "getOffer");
  }
}

/* ─── Checkout (authoritative) ──────────────────────────────── */

export type PlaceOrderActionInput = {
  customer: { name: string; phone: string };
  delivery: {
    governorate: string;
    area: string;
    address: string;
    landmark?: string;
    notes?: string;
  };
  paymentMethod: PaymentMethodId;
  /** Client cart lines — prices/names ignored; validated against DB */
  items: Array<{ productId: string; quantity: number; notes?: string }>;
};

/**
 * Guest checkout against PostgreSQL (atomic transaction).
 * Validates visibility/availability/price server-side.
 * Does not trust client totals.
 */
export async function placeGuestOrderAction(
  input: PlaceOrderActionInput,
): Promise<ActionResult<Order>> {
  try {
    requireDb();

    const { order, customer } = await dbPlaceGuestOrderAtomic({
      customer: input.customer,
      delivery: input.delivery,
      paymentMethod: input.paymentMethod,
      items: input.items,
      deliveryFee: DELIVERY_FEE_IQD,
    });

    // Notification failure must not roll back a successful order
    try {
      await enqueueAndDispatchOrderStatusNotification({
        orderId: order.id,
        customerId: customer.id,
        status: "received",
        customerName: order.customer.name,
        destinationPhone: customer.phone,
      });
    } catch (notifyError) {
      logServerError("placeGuestOrder.notify", notifyError);
    }

    revalidatePath("/admin/orders");
    revalidatePath("/admin/customers");
    revalidatePath("/admin");

    return { ok: true, data: order };
  } catch (error) {
    return fail(error, "placeGuestOrder");
  }
}

/* ─── Orders admin ──────────────────────────────────────────── */

export async function fetchOrdersAction() {
  try {
    await requireAdminDb();
    return { ok: true as const, data: await dbListOrders() };
  } catch (error) {
    return fail(error, "fetchOrders");
  }
}

export async function fetchOrderAction(id: string) {
  try {
    await requireAdminDb();
    const data = await dbGetOrderById(id);
    if (!data) return { ok: false as const, message: "ما لكينا هذا الطلب" };
    return { ok: true as const, data };
  } catch (error) {
    return fail(error, "fetchOrder");
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  nextStatus: OrderStatus,
  note?: string,
) {
  try {
    await requireAdminDb();
    const data = await dbUpdateOrderStatus(orderId, nextStatus, note);
    if (nextStatus === "delivered") {
      await dbRecordActivity({
        customerId: data.customerId,
        type: "order_delivered",
        relatedId: data.id,
      });
    } else if (nextStatus === "cancelled") {
      await dbRecordActivity({
        customerId: data.customerId,
        type: "order_cancelled",
        relatedId: data.id,
      });
    } else if (nextStatus === "confirmed") {
      await dbRecordActivity({
        customerId: data.customerId,
        type: "order_confirmed",
        relatedId: data.id,
      });
    }

    try {
      await enqueueAndDispatchOrderStatusNotification({
        orderId: data.id,
        customerId: data.customerId,
        status: nextStatus,
        customerName: data.customer.name,
        destinationPhone: data.customer.phone,
      });
    } catch (notifyError) {
      logServerError("updateOrderStatus.notify", notifyError);
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin");
    return { ok: true as const, data };
  } catch (error) {
    return fail(error, "updateOrderStatus");
  }
}

export async function fetchOrderNotificationsAction(
  orderId: string,
): Promise<ActionResult<NotificationRecord[]>> {
  try {
    await requireAdminDb();
    const data = await dbListNotificationsForOrder(orderId);
    return { ok: true, data };
  } catch (error) {
    return fail(error, "fetchOrderNotifications");
  }
}

/* ─── CRM / loyalty (Admin) ─────────────────────────────────── */

export async function fetchCustomersAction(query?: string) {
  try {
    await requireAdminDb();
    const data = query?.trim()
      ? await dbSearchCustomers(query)
      : await dbListCustomers();
    return { ok: true as const, data };
  } catch (error) {
    return fail(error, "fetchCustomers");
  }
}

/** Admin CRM + loyalty bootstrap for client cache hydrate. */
export async function fetchCrmBootstrapAction() {
  try {
    await requireAdminDb();
    const [customers, accounts, transactions, config] = await Promise.all([
      dbListCustomers(),
      dbListLoyaltyAccounts(),
      dbListAllLoyaltyTransactions(),
      dbGetLoyaltyConfig(),
    ]);
    return {
      ok: true as const,
      data: { customers, accounts, transactions, config },
    };
  } catch (error) {
    return fail(error, "fetchCrmBootstrap");
  }
}

export async function fetchCustomerDetailAction(id: string) {
  try {
    await requireAdminDb();
    const customer = await dbFindCustomerById(id);
    if (!customer) {
      return { ok: false as const, message: "ما لكينا هذا الزبون" };
    }
    const orders = await dbListOrdersByCustomerId(id);
    const loyalty = await dbGetLoyaltyAccount(id);
    const transactions = await dbListLoyaltyTransactions(id);
    const config = await dbGetLoyaltyConfig();
    return {
      ok: true as const,
      data: { customer, orders, loyalty, transactions, config },
    };
  } catch (error) {
    return fail(error, "fetchCustomerDetail");
  }
}

export async function updateCustomerAction(
  id: string,
  input: { name?: string; status?: "active" | "inactive" },
) {
  try {
    await requireAdminDb();
    const data = await dbUpdateCustomer(id, input);
    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${id}`);
    return { ok: true as const, data };
  } catch (error) {
    return fail(error, "updateCustomer");
  }
}

export async function databaseStatusAction() {
  return {
    configured: isDatabaseConfigured(),
  };
}
