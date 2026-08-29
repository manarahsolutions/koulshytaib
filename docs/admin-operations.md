# Admin operations — كلشي طيب

Phase 11: internal operations dashboard for **delivery-only** homemade food orders.

## Routes

| Path | Purpose |
| --- | --- |
| `/admin` | Dashboard KPIs + active orders |
| `/admin/orders` | Orders list (search + status filter) |
| `/admin/orders/[id]` | Order detail + status actions |

`/admin/dashboard` redirects to `/admin`.

Other `/admin/*` stubs (customers, loyalty, …) remain for future phases and are **not** linked in Admin nav.

## Customer / Admin separation

```text
(customer)/*  → CustomerShell (header + bottom nav)
/admin/*      → AdminShell (ops header + Dashboard/Orders nav)
```

No Admin links in customer navigation. No CustomerShell chrome in Admin.

## Authentication

Admin authentication is implemented (Phase 18). See [admin-auth.md](./admin-auth.md).

```text
/admin/login          → public login
/admin/* (except login) → requireAdmin() + AdminShell
```

Guest customer routes are unaffected.

## Order status transitions

Pure rules: `canTransitionOrderStatus` / `getNextForwardStatus`

```text
received → confirmed → preparing → out_for_delivery → delivered
```

Cancel allowed from: `received` | `confirmed` | `preparing` | `out_for_delivery`  
Forbidden: any change from `delivered` or `cancelled`; skips / backwards on the happy path.

Mutations go through:

```text
updateOrderStatus(orderId, nextStatus)
  → validate transition
  → append statusHistory
  → saveOrder (order-registry)
```

Components must not assign `order.status` directly.

## Dashboard KPIs (Iraq day `Asia/Baghdad`)

| KPI | Definition |
| --- | --- |
| طلبات اليوم | Orders with `createdAt` today |
| إيرادات المكتمل اليوم | Sum of totals for orders that became `delivered` today (history timestamp) |
| طلبات قيد التنفيذ | Not `delivered` and not `cancelled` |
| متوسط قيمة المكتمل | Mean total of delivered-today orders, or `—` if none |

Cancelled never counts toward completed revenue / AOV.

## Persistence

Orders persist in PostgreSQL when `DATABASE_URL` is set (Phase 19). Status changes append history and enqueue customer notifications (Phase 20 — mock provider). See [notifications.md](./notifications.md).

## Loyalty

Status → `delivered` does **not** auto-call `awardPointsForDeliveredOrder` in this phase. Loyalty engine stays independent.

## Security notes

- Do not expose Admin in customer UI
- Phone visible in Admin only; not in public customer pages / URLs
- Do not log customer phones
- Do not claim routes are secured

## Key files

```text
src/app/admin/layout.tsx
src/components/admin/*
src/features/admin/*
src/features/orders/order-service.ts
src/features/orders/order-transitions.ts
src/lib/datetime/iraq-day.ts
```
