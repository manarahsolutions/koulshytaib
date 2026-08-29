# Design System — كلشي طيب (Koulshy Taib)

> **Brand color status:** Values in this document are **initial approximations based on the provided brand board (PDF)**. They are **not** final extractions values from original source brand files (those are not in the workspace yet).

---

## Brand intent

Homemade food + warmth + family gathering + Iraqi/Arab home feeling + modern premium digital product.

**Color philosophy**

| Role | Token / color | Usage |
|------|----------------|-------|
| Primary surface | `--brand-cream` | Page backgrounds, large areas |
| Primary brand | `--brand-raspberry` | CTAs, prices, key badges |
| Secondary accent | `--brand-yellow` | Thin motif accents |
| Supporting / ink | `--brand-green` (+ deep green mix) | Success, text, inverse panels, chips |

**No purple.** Deep text/chrome uses a darkened green mix (still exposed as `--brand-navy` / `brand-navy` utilities for compatibility). Prefer cream + green ink + **one** accent (raspberry or yellow) at a time.

---

## Brand primitives

Defined in `src/styles/tokens.css` as `--brand-*`:

| Token | Value |
|-------|-------|
| `--brand-raspberry` | `#C94A66` |
| `--brand-yellow` | `#D4A84B` |
| `--brand-green` | `#2A8A66` |
| `--brand-cream` | `#FBF6EB` |
| `--brand-navy` | `color-mix(green 42%, #0c1f18)` — deep green ink, **not** purple |

### Documented accessibility tweaks (not hue identity changes)

| Change | Why |
|--------|-----|
| `--color-brand-primary-hover/active` via `color-mix` darker | Clear hover/active without new hue |
| `--color-danger` from raspberry mix | Destructive stays in raspberry family |
| `--color-on-secondary` = deep green ink | Yellow fills fail AA with white text |
| `--color-warning-text` = deep green ink | Readable on cream/yellow tints |
| Softened muted/subtle text | Readable on cream while staying green-ink family |

---

## Semantic colors

Components must use **semantic** tokens, never raw hex / `--brand-*` directly in TSX.

### Brand roles

- `--color-brand-primary` (+ hover / active)
- `--color-brand-secondary` (+ hover)
- `--color-brand-green`
- `--color-brand-navy`

### Surfaces

- `--color-background`
- `--color-surface`
- `--color-surface-warm`
- `--color-surface-elevated`
- `--color-surface-inverse`

### Text

- `--color-text`
- `--color-text-muted`
- `--color-text-subtle`
- `--color-text-disabled`

### Borders

- `--color-border`
- `--color-border-soft`
- `--color-border-strong`

### On-color

- `--color-on-primary`
- `--color-on-secondary`
- `--color-on-dark`
- `--color-on-green`

### Functional

- `--color-success` (+ subtle)
- `--color-warning` (+ subtle + warning-text)
- `--color-danger` (+ hover + subtle)
- `--color-info` (+ subtle)
- `--color-focus-ring`

Tailwind maps these under names like `bg-brand-primary`, `text-text-muted`, `border-border-soft`.

---

## Typography

### Brand faces

```css
--font-family: var(--font-readex-pro, "Readex Pro", …); /* body / UI */
--font-display: var(--font-aref-ruqaa, "Aref Ruqaa", …); /* display / headings */
```

- Loaded via `next/font/google` in `src/app/layout.tsx`:
  - **Aref Ruqaa** (400 / 700) → `--font-aref-ruqaa` → `--font-display` (display Ruqaa; no separate “Display” family on Google Fonts)
  - **Readex Pro** (400 / 500 / 600 / 700) → `--font-readex-pro` → `--font-family` / `--font-sans`
- Pairing: calligraphic Ruqaa for hero/section titles; modern sans for body, labels, prices, and chrome.
- Change typefaces by editing the font loaders + tokens — not by hardcoding faces in components.

### Roles (utilities in `src/styles/typography.css`)

| Role | Class | Face |
|------|--------|------|
| Display | `.typo-display` | Aref Ruqaa (`--font-display`) |
| Heading XL | `.typo-heading-xl` | Aref Ruqaa |
| Heading L | `.typo-heading-l` | Aref Ruqaa |
| Heading M | `.typo-heading-m` | Aref Ruqaa |
| Heading S | `.typo-heading-s` | Aref Ruqaa |
| Body L | `.typo-body-l` | Readex Pro |
| Body M | `.typo-body-m` | Readex Pro |
| Body S | `.typo-body-s` | Readex Pro |
| Caption | `.typo-caption` | Readex Pro |
| Label | `.typo-label` | Readex Pro |
| Price | `.typo-price` (tabular nums) | Readex Pro |

Supports Arabic, English, mixed strings, numbers, and prices. Line-heights are Arabic-friendly (body ~1.65). Neutral letter-spacing on display/headings (Ruqaa does not benefit from tight tracking).

---

## Spacing

4px scale tokens: `--space-1` … `--space-24` → 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.

Prefer these (or Tailwind spacing that matches) over arbitrary values.

---

## Radius

| Token | Intent |
|-------|--------|
| `--radius-sm` | chips, tight controls |
| `--radius-md` | inputs / small buttons |
| `--radius-lg` | default controls |
| `--radius-xl` | cards / large controls |
| `--radius-2xl` | hero media / empty-state icons |
| `--radius-full` | pills / avatars |

Warm & modern — avoid overly bubbly “childish” radii on dense UI.

---

## Shadows

`--shadow-xs` → `--shadow-lg`: soft navy-tinted elevation.

Prefer **border** over shadow when separation is enough.

---

## Motion

- `--duration-fast` 150ms
- `--duration-normal` 250ms
- `--duration-slow` 400ms
- `--ease-standard` / `--ease-emphasized`

`prefers-reduced-motion: reduce` zeroes token durations and disables non-essential transitions/animations in `globals.css`.

---

## Breakpoints (mobile-first)

| Token | Width |
|-------|-------|
| `--bp-sm` | 640px |
| `--bp-md` | 768px |
| `--bp-lg` | 1024px |
| `--bp-xl` | 1280px |

Priority targets: 360 / 390 / 430, then tablet & desktop.

---

## Component conventions

Location: `src/components/ui/`

| Component | Notes |
|-----------|--------|
| `Button` | primary / secondary / ghost / outline / destructive · sm/md/lg · loading |
| `IconButton` | requires `aria-label` · optional `directional` for RTL flip |
| `Badge` | brand / success / warning / danger / neutral · sr-only status label |
| `Input` / `Textarea` / `Select` | `invalid` → `aria-invalid` + danger border |
| `Checkbox` / `Radio` | native + label/description |
| `QuantityStepper` | client · ± with Arabic aria labels |
| `Price` | IQD helper · compare-at for discounts |
| `Divider` | hr or labeled separator |
| `Skeleton` | pulse placeholder |
| `EmptyState` | title / description / action slot |

Import via `@/components/ui`.

**Rules**

- No hardcoded brand hex in components.
- Semantic HTML + keyboard focus (`:focus-visible`).
- RTL-safe: logical properties / Tailwind logical utilities (`ps`/`pe`/`inset-inline-*`).
- Do not auto-flip every icon — only directional controls via `directional`.

Brand pattern hook: `@/components/brand` → `BrandPattern` (`floral` | `geometric`). Does **not** invent artwork; waits for real assets.

---

## RTL rules

1. Root: `<html lang="ar" dir="rtl">`.
2. Prefer `margin-inline`, `padding-inline`, `inset-inline`, `start`/`end`.
3. Do not use transform/rotate/negative positioning for layout mirroring.
4. Flip **only** navigation/chevron/arrow icons when `directional` is set.
5. Design for Arabic copy length, mixed AR/EN, and price alignment — not LTR translated layouts.

---

## Accessibility rules

- Target **WCAG AA** for text and critical controls where applicable.
- Visible focus ring via `--color-focus-ring`.
- Do not rely on color alone (Badge includes sr-only status text; discounts show struck price + label).
- Disabled controls use opacity + `disabled` / `aria-disabled`.
- Icon-only buttons require `aria-label`.
- Loading buttons set `aria-busy`.

---

## Pending brand assets

Place real files under `public/brand/` when available:

```text
public/brand/
  logo.webp              ✅ present (from assets)
  logo-ar.svg            ❌ pending
  logo-en.svg            ❌ pending
  pattern-floral.svg     ❌ pending
  pattern-geometric.svg  ❌ pending
```

Source references today:

- `assets/ملفات كلشي طيب.pdf`
- `assets/brand-sheet.jpg`
- `assets/logo.webp`

Do **not** invent replacement logos or patterns in code.

---

## Files of record

| Path | Role |
|------|------|
| `src/styles/tokens.css` | All design tokens |
| `src/styles/typography.css` | Typographic role classes |
| `src/app/globals.css` | Tailwind theme bridge + a11y motion |
| `docs/design-system.md` | This document |
