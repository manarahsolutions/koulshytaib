/**
 * Derived loyalty metrics — always prefer transactions over cached account fields.
 */

import {
  transactionBalanceDelta,
} from "@/features/loyalty/loyalty-rules";
import {
  loyaltyRepository,
  type LoyaltyRepository,
} from "@/features/loyalty/loyalty-repository";
import type { LoyaltyTransaction } from "@/features/loyalty/types";

export function getLoyaltyTransactions(
  customerId: string,
  repo: LoyaltyRepository = loyaltyRepository,
): LoyaltyTransaction[] {
  return [...repo.listTransactions(customerId)].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function getLoyaltyBalance(
  customerId: string,
  repo: LoyaltyRepository = loyaltyRepository,
): number {
  return repo.listTransactions(customerId).reduce((sum, txn) => {
    return sum + transactionBalanceDelta(txn.type, txn.points);
  }, 0);
}

export function getLifetimeEarned(
  customerId: string,
  repo: LoyaltyRepository = loyaltyRepository,
): number {
  return repo
    .listTransactions(customerId)
    .filter((t) => t.type === "earn")
    .reduce((sum, t) => sum + Math.abs(t.points), 0);
}

export function getLifetimeRedeemed(
  customerId: string,
  repo: LoyaltyRepository = loyaltyRepository,
): number {
  return repo
    .listTransactions(customerId)
    .filter((t) => t.type === "redeem")
    .reduce((sum, t) => sum + Math.abs(t.points), 0);
}

export function resolveOrderIdFromTransaction(
  txn: LoyaltyTransaction,
): string | null {
  if (txn.source?.type === "order") return txn.source.id;
  if (txn.relatedOrderId) return txn.relatedOrderId;
  return null;
}

export function hasEarnTransactionForOrder(
  orderId: string,
  customerId?: string,
  repo: LoyaltyRepository = loyaltyRepository,
): boolean {
  const pool = customerId
    ? repo.listTransactions(customerId)
    : repo.listAllTransactions();

  return pool.some((txn) => {
    if (txn.type !== "earn") return false;
    return resolveOrderIdFromTransaction(txn) === orderId;
  });
}
