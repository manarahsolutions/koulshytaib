"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getCustomersSnapshot,
  subscribeCustomers,
} from "@/features/customers/customer-repository";
import {
  getLoyaltyRevision,
  subscribeLoyalty,
} from "@/features/loyalty/loyalty-repository";
import {
  queryLoyaltyCustomerListItems,
  type LoyaltyCustomerListItem,
} from "@/features/loyalty/selectors";
import {
  getOrdersSnapshot,
  subscribeOrders,
} from "@/features/orders/order-registry";

function subscribeAdminLoyalty(onChange: () => void): () => void {
  const u1 = subscribeLoyalty(onChange);
  const u2 = subscribeCustomers(onChange);
  const u3 = subscribeOrders(onChange);
  return () => {
    u1();
    u2();
    u3();
  };
}

function getRevision(): string {
  return `${getLoyaltyRevision()}:${getCustomersSnapshot().length}:${getOrdersSnapshot().length}`;
}

export function useLoyaltyRevision(): string {
  return useSyncExternalStore(subscribeAdminLoyalty, getRevision, () => "0");
}

export function useLoyaltyCustomerList(query: string): LoyaltyCustomerListItem[] {
  const revision = useLoyaltyRevision();
  return useMemo(
    () => queryLoyaltyCustomerListItems({ query }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, revision],
  );
}
