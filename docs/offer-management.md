# Offer & Promotions Management — كلشي طيب

Phase 15: shared Offer domain for **Admin** and **Customer Homepage**. In-memory only. **Presentation-only** for cart/checkout — no automatic discount application.

## Offer model

See `src/features/offers/types.ts`.

| Field | Meaning |
| --- | --- |
| `id` | Opaque id |
| `title` / `description` | Display copy |
| `productIds` | FK → `Product.id` (shared ProductRepository) |
| `type` | `fixed_price` \| `percentage` |
| `discountPercent` | Integer 1–100 when percentage |
| `offerPrice` / `originalPrice` | Integer IQD when fixed_price |
| `visible` | Customer may see it |
| `active` | Promotion is usable / eligible |
| `featured` | Homepage primary slot (at most one) |
| `badge` | Chip label |
| `imageSrc` | Optional public path |
| `ctaLabel` / `surface` | Customer card chrome |
| `expiresLabel` | Seed display copy only — **not** a schedule |
| `sortOrder` / timestamps | Ordering + audit |

No `archived` / `published` / coupon fields.

## Pricing

### Fixed price

- Requires **exactly one** product
- `offerPrice` is authoritative and does **not** change when the product catalog price changes
- `originalPrice` optional; UI may fall back to current product price for compare-at

### Percentage

- One or more products allowed
- Customer-facing price = `round(catalogPrice × (1 − percent/100))` using **nearest IQD** (`Math.round`)
- When product price changes, **displayed** offer price changes

Helpers: `src/features/offers/pricing.ts` (`calculatePercentageOfferPrice`, `resolveOfferPricing`).

## Product relationship

- Resolve via ProductRepository only
- Missing product: Admin warning «يوجد منتج مرتبط غير موجود»; Customer excludes invalid links
- If no orderable (visible + available + browsable category) products remain → offer excluded from Customer selectors
- Stored `productIds` are **not** auto-rewritten

## Active vs visible vs featured

| Flag | Role |
| --- | --- |
| `visible` | Show in customer-facing selectors |
| `active` | Promotion considered usable |
| `featured` | Primary Homepage card (service demotes other featured offers) |

Customer eligibility: `visible && active && ≥1 orderable product && resolvable pricing`.

## Ordering

Featured first, then `sortOrder` ascending, then Arabic title. Admin up/down via `moveOffer`.

## Architecture

```
Admin UI → offer-service → offer-repository (in-memory)
Customer Homepage → selectors (getFeaturedOffer / getSecondaryOffers)
```

Seed: `seed-offers.ts` (adapted Phase 5 mock offers — one dataset).

## Customer Homepage

`OffersSection` + `OfferCard` keep visual design. Data from selectors. CTA:

- 1 product → `/product/[id]`
- multiple → `/menu`

## Cart / checkout / orders

- **No** automatic cart or checkout discount in this phase
- Homepage discounted price is **presentation**
- Order line snapshots unchanged; no `offerId` on orders

## Limits (explicitly out of scope)

- No scheduling (`startsAt`/`endsAt`)
- No coupons / BOGO / cart-wide rules
- No loyalty / analytics / upload / auth / database
- Soft-hide only (`visible`/`active`) — **no delete button**

## Persistence / auth / backend

Catalog/offers persist via PostgreSQL when `DATABASE_URL` is set. Admin mutations require authentication — see [admin-auth.md](./admin-auth.md).

## Admin routes

| Path | Purpose |
| --- | --- |
| `/admin/offers` | List, search, filters, toggles |
| `/admin/offers/new` | Create |
| `/admin/offers/[id]` | Edit + ops summary |

Nav includes **العروض** after المنتجات.
