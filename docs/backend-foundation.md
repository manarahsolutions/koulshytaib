# Backend Foundation — كلشي طيب (Phase 17)

PostgreSQL + Prisma replace in-memory persistence for production readiness while preserving Repository → Service → UI boundaries.

## Technology

| Choice | Value |
| --- | --- |
| Database | PostgreSQL |
| ORM | Prisma 6 (`@prisma/client`) |
| Client | `src/lib/db/prisma.ts` (server-only singleton) |
| Mutations from Client UI | Next.js Server Actions (`src/app/actions/backend.ts`) |

## Environment

Copy `.env.example` → `.env`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/koulshy_taib?schema=public"
```

Never commit `.env` or real credentials.

### Commands

```bash
npm run db:generate          # prisma generate
npm run db:migrate           # prisma migrate dev (local)
npm run db:migrate:deploy    # prisma migrate deploy
npm run db:seed              # seed demo catalog
npm run db:studio            # Prisma Studio
npm run db:reset             # migrate reset + seed (destructive — local only)
```

Build runs `prisma generate` before `next build`.

## Schema overview

Tables: `Customer`, `Category`, `Product`, `Offer`, `OfferProduct`, `Order`, `OrderItem`, `OrderStatusHistory`, `LoyaltyAccount`, `LoyaltyTransaction`, `CustomerActivity`, `AppConfig`.

Money fields are **integer IQD**.

### Relationships

- Customer 1—∗ Order
- Category 1—∗ Product
- Offer ∗—∗ Product via `OfferProduct`
- Order 1—∗ OrderItem (snapshots)
- Order 1—∗ OrderStatusHistory
- Customer 1—1 LoyaltyAccount 1—∗ LoyaltyTransaction

### Featured offer

Partial unique index: at most one row with `featured = true`.

### Loyalty earn idempotency

Unique `(type, relatedOrderId)` — prevents double earn for the same order. **Auto-award remains disabled** (`enabled: false`).

## Architecture

```
Client UI
  → Server Actions (backend.ts)
    → DB repositories (db-*-repository.ts)
      → Prisma → PostgreSQL

Server Components / SSR
  → server-data.ts (DB if DATABASE_URL, else in-memory seed)
```

In-memory repositories remain as a **client cache** + **fallback when DATABASE_URL is unset**. `DbHydrateClient` loads Postgres (catalog, offers, and for Admin: orders + CRM + loyalty) into that cache when the DB is configured. Admin catalog/offer mutations go through Server Actions when DB is configured, then update the client cache.

## Transactions

| Flow | Atomic unit |
| --- | --- |
| Guest checkout | resolve/create customer + order + items + status history + activity |
| Order status | validate transition + update status + append history |
| Featured offer | demote others + update offer |
| Loyalty append | insert txn + recompute cached balances |

## Customer identity

- Opaque `Customer.id` (cuid)
- Unique normalized `phone` via `normalizeIraqiPhone()` (single helper)
- Phone never used as PK or in URLs
- Existing name not overwritten on reuse

## Order snapshots

`OrderItem` stores `name`, `unitPrice`, `quantity`, `lineTotal`. Product price/name changes do not rewrite history. `productId` is nullable (`ON DELETE SET NULL`).

Order `id` is an opaque cuid used in customer/admin URLs.

## Checkout validation (DB mode)

`placeGuestOrderAction` ignores client prices/totals. It reloads products from DB and rejects hidden/unavailable items. Delivery fee uses existing `DELIVERY_FEE_IQD` mock constant until configured in Admin.

## Cart

Still **localStorage**. Not persisted in Postgres.

## Seed

`prisma/seed.ts` upserts Phase 6/15 demo categories, products, offers, one demo customer (`07000000001`), empty loyalty account, and `AppConfig` with loyalty **disabled**.

## Privacy

- No phone in URLs / localStorage / public pages
- Server error logs redact `07XXXXXXXXX`
- UI never receives SQL/Prisma internals

## Security review (Phase 17)

- Prisma only imported under `server-only` / Server Actions
- No client `DATABASE_URL`
- No raw SQL from user input
- Transition rules enforced server-side
- Safe Arabic error messages

## Current limitations

- **Customer login intentionally not implemented** (guest-first)
- Admin authentication: see [admin-auth.md](./admin-auth.md)
- Payment / WhatsApp / SMS / maps / notifications / Instagram not implemented
- Loyalty economy still disabled
- Offers remain presentation-only (no cart discount engine)
- Without `DATABASE_URL`, app falls back to in-memory for catalog/orders demo; Admin login requires DB + `ADMIN_SESSION_SECRET`
- Runtime DB migrate/seed verification requires a live Postgres instance
- Delivery fee still uses mock `DELIVERY_FEE_IQD` until Admin config exists

## Runtime verification status

Phase 19 documents live Postgres workflow in [runtime-database.md](./runtime-database.md).

Use `npm run db:verify` after migrate + seed.
