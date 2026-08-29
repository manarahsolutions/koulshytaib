# Product & Menu Management — كلشي طيب

Phase 14: shared Product/Category domain for **Admin** and **Customer Menu**. In-memory only — no database, auth, or file upload.

## Product model

Fields (see `src/types/catalog.ts`):

| Field | Meaning |
| --- | --- |
| `id` | Opaque id (seed keeps demo ids; new rows use UUID) |
| `name` / `description` | Display copy |
| `price` | Integer IQD |
| `categoryId` | FK → `Category.id` (not category name) |
| `imageSrc` / `imageAlt` | Optional public path under `public/` |
| `available` | Can the customer order it now? |
| `visible` | Should it appear in the customer menu? |
| `sortOrder` | Deterministic menu order within category |
| `createdAt` / `updatedAt` | ISO timestamps |

Optional UI-only: `badges`, `oldPrice` (seed/demo).

## Category model

| Field | Meaning |
| --- | --- |
| `id` | Opaque id |
| `name` | Display name |
| `accent` / `href` | Customer chrome (deep-link `/menu?category=…`) |
| `visible` | Show category chip / browsing |
| `sortOrder` | Customer menu category order |
| `createdAt` / `updatedAt` | ISO timestamps |

## Repository architecture

- `src/features/products/category-repository.ts` — in-memory categories + subscribe/snapshot
- `src/features/products/product-repository.ts` — in-memory products + subscribe/snapshot
- Seed: `src/features/products/seed-catalog.ts` (same Phase 6 demo dishes — **one** seed set)
- Compatibility facade: `src/features/menu/mock-products.ts` → repository getters

UI must not mutate arrays directly.

## Service architecture

- `product-service.ts` — create / update / availability / visibility / reorder
- `category-service.ts` — create / update / visibility / reorder

Pattern: Admin UI → service → repository.

## Availability vs visibility

| `visible` | `available` | Customer effect |
| --- | --- | --- |
| true | true | In menu; can add to cart |
| true | false | In menu; cannot order (“غير متوفر حالياً”) |
| false | * | Hidden from menu/detail browsing |
| * | * + category `visible=false` | Not browsable via customer category nav |

Hiding a category does **not** flip `product.visible`. Admin still sees those products.

## Shared Customer / Admin source

Customer Menu, Product Detail, Homepage popular/categories, Cart/Checkout resolution, and Admin Products all read the same repositories.

## Ordering

Customer Menu:

1. categories by `sortOrder` (visible only)
2. products by `sortOrder` then name

Admin reorder: up/down via services (no drag-and-drop).

## Images

- No upload backend / CDN / processing
- Optional `imageSrc` as a public URL path
- Missing image → `FoodMediaPlaceholder` / “لا توجد صورة”

## Persistence limitation

In-memory only. **Refresh resets Admin mutations** to seed. No `localStorage` for catalog.

## Deletion strategy

- **No product delete button** — use `visible = false`
- **No category delete button** — use `visible = false` (avoids orphaned `categoryId`)

## Cart / historical order safety

- Cart stores `{ productId, quantity, notes? }` and resolves **live** price via `getProductById` (existing Phase 6 behavior — documented limitation until checkout snapshots)
- If a product becomes unavailable after add: cart keeps the line, shows “غير متوفر حالياً”, does not auto-delete
- Orders store `OrderLineSnapshot` (`name`, `unitPrice`, `lineTotal`) at checkout — later product price edits **do not** change historical orders

## Authentication / backend limitation

- Admin auth: see [admin-auth.md](./admin-auth.md)
- Persistence: PostgreSQL + Prisma when `DATABASE_URL` is set (Phase 17+)

## Admin routes

| Path | Purpose |
| --- | --- |
| `/admin/products` | List, search, filters, toggles, reorder |
| `/admin/products/new` | Create |
| `/admin/products/[id]` | Edit + ops summary |
| `/admin/products/categories` | Categories CRUD-lite (no delete) |

Nav: لوحة التحكم · الطلبات · الزبائن · الولاء · **المنتجات**

## Selectors

`src/features/products/selectors.ts` — visible/available filters, Arabic-normalized search, category counts, public browsability.
