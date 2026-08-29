# Runtime Database — كلشي طيب (Phase 19)

Turns Phase 17/18 architecture into a **running PostgreSQL** system for local development and verification.

## Goal

```text
Architecture implemented  →  Actually running against PostgreSQL
```

Verified flows:

1. Guest checkout → customer resolve/create → order + item snapshots + status history (atomic)
2. Admin order list/detail/status (survives refresh / process restart)
3. CRM phone normalization + reuse without name overwrite
4. Catalog / offers mutations persist

## Local Postgres (this machine)

Phase 19 uses a **project-local** cluster (not the Windows service password):

| Item | Value |
| --- | --- |
| Data dir | `.postgres-data/` (gitignored) |
| Port | `5433` |
| User | `koulshy` (trust on localhost) |
| Database | `koulshy_taib` |
| URL | `postgresql://koulshy@127.0.0.1:5433/koulshy_taib?schema=public` |

Requires PostgreSQL 16 client/server binaries (e.g. `C:\Program Files\PostgreSQL\16\bin`).

### Commands

```bash
npm run db:local:start    # start cluster on :5433
npm run db:local:status
npm run db:migrate:deploy
npm run db:seed
npm run db:verify         # smoke checks
npm run db:local:stop
```

Copy `.env.example` → `.env` and set at least:

```bash
DATABASE_URL="postgresql://koulshy@127.0.0.1:5433/koulshy_taib?schema=public"
ADMIN_SESSION_SECRET="…long random…"
ADMIN_SEED_IDENTIFIER="admin@example.com"
ADMIN_SEED_PASSWORD="…min 8 chars…"
```

Never commit `.env` or `.postgres-data/`.

### First-time cluster init (if `.postgres-data` missing)

```powershell
$env:Path = "C:\Program Files\PostgreSQL\16\bin;" + $env:Path
initdb -D .postgres-data -U koulshy -A trust -E UTF8 --locale=C
npm run db:local:start
createdb -h 127.0.0.1 -p 5433 -U koulshy koulshy_taib
npm run db:migrate:deploy
npm run db:seed
```

## Atomic guest checkout

`dbPlaceGuestOrderAtomic` (`src/features/orders/db-guest-checkout.ts`) runs in one Prisma transaction:

- normalize phone
- find or create customer (no name overwrite on reuse)
- ensure loyalty account shell
- validate products (visible + available) and use **DB prices**
- create order + line snapshots + `received` history
- record `order_created` activity

`placeGuestOrderAction` calls this path when `DATABASE_URL` is set.

## Admin persistence

With DB configured and Admin authenticated:

- Orders hydrate from Postgres (`fetchOrdersAction`)
- Status changes go through `updateOrderStatusAction` → DB transaction + history
- Catalog/offer Admin mutations use Server Actions → DB → client cache upsert

Refresh / restart no longer loses DB-backed entities.

## Verification script

`npm run db:verify` checks:

- seed catalog + admin
- guest checkout create
- CRM reuse / name preserve
- status history
- product availability flip + restore
- ≤1 featured offer

Phones used in the script are synthetic and not logged.

## Runtime status (session notes)

Document whether migrate/seed/verify were executed against a live instance in the Phase 19 final report.

## Limitations

- Local trust auth is for **dev only** — production must use strong passwords / managed Postgres
- Cart remains browser localStorage
- Loyalty economy still disabled
- Delivery fee still mock constant
- Without `DATABASE_URL`, guest/admin DB paths are unavailable (fail closed for Admin auth)
