"use client";

import { useEffect, useRef } from "react";
import {
  databaseStatusAction,
  fetchCatalogAction,
  fetchCrmBootstrapAction,
  fetchOffersAction,
  fetchOrdersAction,
} from "@/app/actions/backend";
import { replaceCustomersFromServer } from "@/features/customers/customer-repository";
import { replaceOffersFromServer } from "@/features/offers/offer-repository";
import { replaceOrdersFromServer } from "@/features/orders/order-registry";
import { replaceLoyaltyFromServer } from "@/features/loyalty/loyalty-repository";
import { setLoyaltyConfig } from "@/features/loyalty/loyalty-service";
import { replaceCategoriesFromServer } from "@/features/products/category-repository";
import { replaceProductsFromServer } from "@/features/products/product-repository";

/**
 * When DATABASE_URL is configured, hydrate in-memory client caches from Postgres
 * so existing Admin/Customer hooks keep working without importing Prisma.
 */
export function DbHydrateClient({ scope }: { scope: "admin" | "customer" }) {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void (async () => {
      const status = await databaseStatusAction();
      if (!status.configured) return;

      const catalog = await fetchCatalogAction();
      if (catalog.ok) {
        replaceCategoriesFromServer(catalog.data.categories);
        replaceProductsFromServer(catalog.data.products);
      }

      const offers = await fetchOffersAction();
      if (offers.ok) {
        replaceOffersFromServer(offers.data);
      }

      if (scope === "admin") {
        const orders = await fetchOrdersAction();
        if (orders.ok) {
          replaceOrdersFromServer(orders.data);
        }

        const crm = await fetchCrmBootstrapAction();
        if (crm.ok) {
          replaceCustomersFromServer(crm.data.customers);
          replaceLoyaltyFromServer({
            accounts: crm.data.accounts,
            transactions: crm.data.transactions,
          });
          setLoyaltyConfig(crm.data.config);
        }
      }
    })();
  }, [scope]);

  return null;
}
