/**
 * Customer store entry — re-exports the in-memory repository singleton.
 * Prefer `customer-service` from UI/order layers.
 */

export {
  createInMemoryCustomerRepository,
  customerRepository,
} from "@/features/customers/customer-repository";
