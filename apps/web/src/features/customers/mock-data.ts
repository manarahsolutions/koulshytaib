/**
 * Optional demo CRM seed — clearly fake, never production.
 * Not loaded automatically into the live guest flow.
 */

import type { Customer } from "@/features/customers/types";

export const DEMO_CUSTOMER_PHONE = "07000000000";

export const DEMO_CUSTOMER_SEED: Omit<
  Customer,
  "id" | "createdAt" | "updatedAt"
> = {
  phone: DEMO_CUSTOMER_PHONE,
  name: "Demo Customer",
  status: "active",
};
