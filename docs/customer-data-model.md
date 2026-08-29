# Customer data model — كلشي طيب

Phase 9 foundation. **No customer login.** Identity is phone-first and guest-compatible.

## Customer

| Field | Notes |
| --- | --- |
| `id` | Opaque internal identifier (never use phone as PK) |
| `phone` | Normalized unique Iraqi mobile `07XXXXXXXXX` |
| `name?` | Canonical name — **first checkout wins**; later checkouts do not overwrite |
| `status` | `active` \| `inactive` (inactive ≠ deleted) |
| `createdAt` / `updatedAt` | ISO timestamps |

## Phone normalization

Single source: `src/lib/format/phone.ts`

Accepted inputs → `07XXXXXXXXX`:

- `07XXXXXXXXX`
- `7XXXXXXXXX`
- `+9647XXXXXXXXX` / `9647XXXXXXXXX`

Checkout, CRM lookup, and `placeGuestOrder` all reuse this helper.

## Uniqueness

Normalized `phone` is unique in the mock repository. Creating a second customer with the same phone throws.

## Guest order → customer

```text
Checkout phone
  → normalizeIraqiPhone
  → resolveCustomer (find or create)
  → placeGuestOrder
  → Order.customerId + Order.customer snapshot
```

- **New phone** → create customer (+ empty loyalty account shell)
- **Existing phone** → reuse customer; preserve canonical name

## Order relationship

```text
Customer 1 ──< many Orders
```

`Order` includes:

- `customerId` — FK to CRM customer
- `customer` — checkout-time snapshot (`name`, normalized `phone`) for fulfillment/display

Do not treat the snapshot as the source of identity.

## Metrics (derived)

Computed in `customer-metrics.ts` from order history — **not** stored as source of truth.

| Metric | Rule |
| --- | --- |
| `completedOrders` | `status === "delivered"` |
| `totalSpend` / `lifetimeValue` / `averageOrderValue` | **Delivered only** |
| `cancelledOrders` | Cancelled count (excluded from spend) |
| `classification` | `new` if 0 delivered; `returning` if ≥1 delivered |
| `favoriteProductIds` / `favoriteCategoryIds` | Most ordered quantities among delivered |

A customer **record alone** does not mean returning — completed (delivered) orders do.

## Activity types

`order_created` · `order_confirmed` · `order_delivered` · `order_cancelled` · `points_earned` · `points_redeemed`

Recorded in-memory for future CRM timelines — no UI yet.

## Tags (labels only)

`new` · `returning` · `high_value` · `frequent` · `inactive`

Prepared for future derived labels — **no RFM / ML / churn engine**.

## Loyalty foundation

- `LoyaltyAccount` + `LoyaltyTransaction`
- Config: `enabled: false`, placeholder rates = `0`
- Transactions preferred as balance source; `pointsBalance` is a cache
- No earn/redeem while disabled; no conversion ratio invented

## Repository / service boundary

- `CustomerRepository` — data access contract
- `customer-service` — resolution, search, CRM selectors
- In-memory mock today; swap for API later without changing UI contracts

Admin-ready selectors (no UI): `getCustomerCount`, `getNewCustomers`, `getReturningCustomers`, `getTotalRevenue`, `getAverageOrderValue`.

## Persistence boundaries

| Store | What |
| --- | --- |
| `localStorage` | Cart only |
| `sessionStorage` | Active order confirmation / tracking handoff |
| In-memory (JS runtime) | Mock customers, order registry, loyalty, activities |

**Not** a CRM database in the browser. Full reload clears mock CRM memory.

## Privacy

- Do not expose phone / address / full order history on public pages
- Do not put phone in URLs
- Do not log phones or customer objects
- Opaque ids are internal — not customer-facing order numbers

## Explicitly out of scope (later phases)

Admin CRM UI · customer profile · loyalty UI · login/signup · real backend · marketing automation
