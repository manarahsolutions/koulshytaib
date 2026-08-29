# Customer CRM (Admin) — كلشي طيب

Phase 12: browse/search/inspect customers inside Admin. **Read-only CRM UI.**

## Routes

| Path | Purpose |
| --- | --- |
| `/admin/customers` | Customer list + search/filters |
| `/admin/customers/[id]` | Customer profile + order history |

Route param is **opaque `customerId`** — never phone.

Admin nav: لوحة التحكم · الطلبات · الزبائن

## Identity

- `Customer.id` — opaque primary key
- `Customer.phone` — normalized unique attribute (`07XXXXXXXXX`)
- Orders link via `Order.customerId` (authoritative; not phone matching)

## Metrics (Phase 9 rules)

Only **`delivered`** orders count toward:

- completed order count
- spend / قيمة العميل (`lifetimeValue`)
- AOV
- returning classification
- “آخر طلب مكتمل” (`lastDeliveredAt`)

Cancelled / pending / in-progress statuses appear in **order history** but not in those metrics.

### New vs returning

| Type | Arabic | Rule |
| --- | --- | --- |
| new | جديد | 0 delivered orders |
| returning | عائد | ≥1 delivered order |

Customer record existence alone does **not** mean returning.

## Search & filters

- Search: name + normalized phone (shared `normalizeIraqiPhone`)
- Filters: الكل · زبائن جدد · زبائن عائدين
- Sort: most recent activity first (`lastOrderAt` / fallback `createdAt`)

## Privacy

- Phone visible in Admin CRM only
- Not in URLs, customer-facing pages, logs, or localStorage

## Persistence

CRM data is **in-memory** (customer repository + order registry). Refresh clears mutations; demo seed re-applies when empty.

## Authentication

**Admin authentication is implemented** — see [admin-auth.md](./admin-auth.md).

## Out of scope

Loyalty UI · edit/delete customer · create customer UI · charts · export · WhatsApp/call · segmentation · backend

## Key files

```text
src/features/customers/selectors.ts
src/features/customers/use-crm-customers.ts
src/components/admin/admin-customers-client.tsx
src/components/admin/admin-customer-detail-client.tsx
src/app/admin/customers/
docs/customer-crm.md
```
