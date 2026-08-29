"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getCustomersSnapshot,
  subscribeCustomers,
} from "@/features/customers/customer-repository";
import {
  queryCustomerListItems,
  type CustomerListFilter,
  type CustomerListItem,
} from "@/features/customers/selectors";
import {
  getOrdersSnapshot,
  subscribeOrders,
} from "@/features/orders/order-registry";
import type { Customer } from "@/features/customers/types";

const EMPTY_CUSTOMERS: Customer[] = [];

function subscribeCrm(onChange: () => void): () => void {
  const unsubOrders = subscribeOrders(onChange);
  const unsubCustomers = subscribeCustomers(onChange);
  return () => {
    unsubOrders();
    unsubCustomers();
  };
}

/** Revision token so metrics recompute when orders or customers change. */
function getCrmRevision(): string {
  const customers = getCustomersSnapshot();
  const orders = getOrdersSnapshot();
  const orderSig = orders
    .map((o) => `${o.id}:${o.status}:${o.updatedAt ?? o.createdAt}`)
    .join("|");
  return `${customers.length}:${orderSig}`;
}

export function useCrmRevision(): string {
  return useSyncExternalStore(subscribeCrm, getCrmRevision, () => "0");
}

export function useCustomerListItems(input: {
  query: string;
  filter: CustomerListFilter;
}): CustomerListItem[] {
  const revision = useCrmRevision();
  return useMemo(
    () =>
      queryCustomerListItems({
        query: input.query,
        filter: input.filter,
      }),
    // revision captures order/customer mutations
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.query, input.filter, revision],
  );
}

export function useCustomers(): Customer[] {
  return useSyncExternalStore(
    subscribeCustomers,
    getCustomersSnapshot,
    () => EMPTY_CUSTOMERS,
  );
}
