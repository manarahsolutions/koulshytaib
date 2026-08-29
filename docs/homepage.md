# Homepage — كلشي طيب (Phase 16)

Customer homepage finalization and guest experience polish. Guest-first: **no login / profile**.

## Section order

1. **Hero** — `HeroSection`
2. **Categories** — `CategoryScroller`
3. **Popular** — `PopularProductsSection` (“الأكثر طلباً من أهلنا”)
4. **Reels** — `ReelsSection` (“من مطبخنا”)
5. **Offers** — `OffersSection`
6. **Brand story** — `BrandStorySection`
7. **Delivery CTA** — `DeliveryCtaSection`
8. **Footer** — `CustomerFooter` (via CustomerShell)

Rhythm: warm Iraqi + mature editorial — cream dominant, navy type, raspberry CTAs, restrained yellow accents and textile motifs.

## Data sources

| Section | Source | Rules |
| --- | --- | --- |
| Categories | `getVisibleCategories()` / Product category repo | `visible` only; `sortOrder`; href `/menu?category={id}` |
| Popular | `getPopularProducts()` / `POPULAR_PRODUCT_IDS` seed | Publicly browsable **and** available; **not** real popularity metrics |
| Reels | `MOCK_REELS` | Demo media only; no fake IG URLs / likes |
| Offers | OfferRepository selectors | `visible` + `active` + orderable product(s) + resolvable pricing |
| Brand / Delivery | Static editorial copy | No invented fees, zones, ETAs, or business claims |

Menu category deep-links: homepage category cards → `/menu?category=…` → `MenuPageClient` reads `searchParams`.

## Offer eligibility (customer)

Same Phase 15 rules. CTAs:

- 1 product → `/product/[id]`
- multi → `/menu`

**Presentation-only** — discounts do not apply to cart/checkout.

## Popularity limitation

“الأكثر طلباً” uses a **deterministic seed ID list**. Not sales analytics. Copy states this is experimental/demo selection.

## Reel media limitation

Placeholders until real assets. CTA “شوف الطبخة” only when `productId` is set → `/product/[id]`. No engagement metrics.

## No-login architecture

CustomerShell: header + main + footer + mobile bottom nav. No account entry points. Cart remains localStorage; catalog/offers/CRM/loyalty remain in-memory as prior phases.

## Delivery-only positioning

Hero + delivery CTA state delivery-only service. No invented delivery operations data.

## Iraqi motif usage

`DecorativeMotif` as dividers, hero field, corners, strips — not behind every card. Density kept subtle.

## Responsive

- Mobile: rails with snap/peek; bottom nav clearance on footer
- Desktop: popular grid; ~4–5 reel cards width-dependent
- Touch targets ≥44px on primary controls
- RTL via root `lang="ar" dir="rtl"`

## Empty states

Empty categories / popular / reels / offers sections **hide** rather than leave broken chrome. `/offers` shows «ماكو عروض حالياً» when none eligible.

## SEO

Arabic-first title/description + Open Graph foundation (`ar_IQ`). No fake OG images/URLs.

## Screenshots

No screenshot tooling is present in the repo; Phase 16 did **not** add Playwright/Puppeteer. Visual QA should be done manually at 390 / 768 / 1280.
