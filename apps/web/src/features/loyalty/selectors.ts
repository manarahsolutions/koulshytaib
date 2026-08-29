/**
 * Admin loyalty selectors — pure view models over loyalty + customer domains.
 */

import { getCustomers } from "@/features/customers/selectors";
import {
  getCustomerType,
  getCustomerTypeLabel,
  buildCustomerListItem,
  type CustomerTypeLabel,
} from "@/features/customers/selectors";
import type { Customer } from "@/features/customers/types";
import {
  getLifetimeEarned,
  getLifetimeRedeemed,
  getLoyaltyBalance,
  getLoyaltyTransactions,
  resolveOrderIdFromTransaction,
} from "@/features/loyalty/loyalty-metrics";
import { loyaltyRepository } from "@/features/loyalty/loyalty-repository";
import { getLoyaltyConfig } from "@/features/loyalty/loyalty-service";
import type {
  LoyaltyAccount,
  LoyaltyConfig,
  LoyaltyTransaction,
  LoyaltyTransactionType,
} from "@/features/loyalty/types";
import { normalizeIraqiPhone } from "@/lib/format/phone";

export type LoyaltyTxnTypeLabel = "اكتساب" | "استبدال" | "تعديل";
export type LoyaltySourceLabel = "طلب" | "مكافأة" | "تعديل يدوي";

export const LOYALTY_TXN_TYPE_LABELS: Record<
  LoyaltyTransactionType,
  LoyaltyTxnTypeLabel
> = {
  earn: "اكتساب",
  redeem: "استبدال",
  adjust: "تعديل",
};

export function getLoyaltyTxnTypeLabel(
  type: LoyaltyTransactionType,
): LoyaltyTxnTypeLabel {
  return LOYALTY_TXN_TYPE_LABELS[type];
}

export function getLoyaltySourceLabel(
  txn: LoyaltyTransaction,
): LoyaltySourceLabel | null {
  const sourceType = txn.source?.type;
  if (sourceType === "order") return "طلب";
  if (sourceType === "reward") return "مكافأة";
  if (sourceType === "manual") return "تعديل يدوي";
  if (txn.relatedOrderId) return "طلب";
  return null;
}

/** Signed amount for display (earn +, redeem −, adjust as stored). */
export function getTransactionDisplayPoints(txn: LoyaltyTransaction): number {
  if (txn.type === "earn") return Math.abs(txn.points);
  if (txn.type === "redeem") return -Math.abs(txn.points);
  return txn.points;
}

export type LoyaltyOverviewMetrics = {
  accountCount: number;
  totalBalance: number;
  totalEarned: number;
  totalRedeemed: number;
};

export function getLoyaltyOverviewMetrics(): LoyaltyOverviewMetrics {
  const accounts = loyaltyRepository.listAccounts();
  let totalBalance = 0;
  let totalEarned = 0;
  let totalRedeemed = 0;

  for (const account of accounts) {
    totalBalance += getLoyaltyBalance(account.customerId);
    totalEarned += getLifetimeEarned(account.customerId);
    totalRedeemed += getLifetimeRedeemed(account.customerId);
  }

  return {
    accountCount: accounts.length,
    totalBalance,
    totalEarned,
    totalRedeemed,
  };
}

export type LoyaltyCustomerListItem = {
  customer: Customer;
  account: LoyaltyAccount | null;
  balance: number | null;
  lifetimeEarned: number | null;
  lifetimeRedeemed: number | null;
  lastActivityAt: string | null;
  typeLabel: CustomerTypeLabel;
};

export function buildLoyaltyCustomerListItem(
  customer: Customer,
): LoyaltyCustomerListItem {
  const account = loyaltyRepository.getAccount(customer.id);
  const metrics = buildCustomerListItem(customer).metrics;
  const txns = account ? getLoyaltyTransactions(customer.id) : [];
  const lastActivityAt = txns[0]?.createdAt ?? account?.updatedAt ?? null;

  return {
    customer,
    account,
    balance: account ? getLoyaltyBalance(customer.id) : null,
    lifetimeEarned: account ? getLifetimeEarned(customer.id) : null,
    lifetimeRedeemed: account ? getLifetimeRedeemed(customer.id) : null,
    lastActivityAt,
    typeLabel: getCustomerTypeLabel(getCustomerType(metrics)),
  };
}

export function buildLoyaltyCustomerListItems(
  customers: Customer[] = getCustomers(),
): LoyaltyCustomerListItem[] {
  return customers.map(buildLoyaltyCustomerListItem);
}

/** Customers with loyalty activity first, then by last activity desc. */
export function sortLoyaltyCustomerListItems(
  items: LoyaltyCustomerListItem[],
): LoyaltyCustomerListItem[] {
  return [...items].sort((a, b) => {
    const aActive = a.lastActivityAt ? 1 : 0;
    const bActive = b.lastActivityAt ? 1 : 0;
    if (bActive !== aActive) return bActive - aActive;
    if (a.lastActivityAt && b.lastActivityAt) {
      const cmp = b.lastActivityAt.localeCompare(a.lastActivityAt);
      if (cmp !== 0) return cmp;
    }
    return b.customer.createdAt.localeCompare(a.customer.createdAt);
  });
}

export function searchLoyaltyCustomerListItems(
  items: LoyaltyCustomerListItem[],
  query: string,
): LoyaltyCustomerListItem[] {
  const q = query.trim();
  if (!q) return items;

  const asPhone = normalizeIraqiPhone(q);
  const digits = q.replace(/\D/g, "");
  const lower = q.toLowerCase();

  return items.filter(({ customer }) => {
    if (asPhone && customer.phone === asPhone) return true;
    if (digits.length >= 3 && customer.phone.includes(digits)) return true;
    if (customer.name?.toLowerCase().includes(lower)) return true;
    return false;
  });
}

export function queryLoyaltyCustomerListItems(input: {
  query?: string;
}): LoyaltyCustomerListItem[] {
  const items = buildLoyaltyCustomerListItems();
  const searched = searchLoyaltyCustomerListItems(items, input.query ?? "");
  return sortLoyaltyCustomerListItems(searched);
}

export type LoyaltyTxnFilter = "all" | LoyaltyTransactionType;

export function filterLoyaltyTransactions(
  transactions: LoyaltyTransaction[],
  filter: LoyaltyTxnFilter,
): LoyaltyTransaction[] {
  if (filter === "all") return transactions;
  return transactions.filter((t) => t.type === filter);
}

export function getRelatedOrderId(txn: LoyaltyTransaction): string | null {
  return resolveOrderIdFromTransaction(txn);
}

export function getLoyaltyConfigSnapshot(): LoyaltyConfig {
  return getLoyaltyConfig();
}

export function mapLoyaltyErrorMessage(code: string): string {
  switch (code) {
    case "LOYALTY_DISABLED":
      return "نظام الولاء غير مفعّل حالياً.";
    case "EARNING_DISABLED":
      return "اكتساب النقاط غير مفعّل حالياً.";
    case "REDEMPTION_DISABLED":
      return "استبدال النقاط غير متاح حالياً.";
    case "INSUFFICIENT_POINTS":
      return "رصيد النقاط غير كافٍ لهذه العملية.";
    case "INVALID_POINTS":
      return "تأكد من قيمة النقاط (عدد صحيح وغير صفر).";
    case "ORDER_NOT_ELIGIBLE":
      return "هذا الطلب غير مؤهل لاكتساب النقاط.";
    case "ALREADY_AWARDED":
      return "تم منح نقاط هذا الطلب مسبقاً.";
    case "NOT_IMPLEMENTED":
      return "هالميزة مو جاهزة بعد.";
    default:
      return "صار خطأ، حاول مرة ثانية.";
  }
}
