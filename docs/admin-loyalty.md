# Admin Loyalty — كلشي طيب

Phase 13: Admin UI over the Phase 10 loyalty engine. **No customer-facing loyalty.**

## Routes

| Path | Purpose |
| --- | --- |
| `/admin/loyalty` | Overview, config, customer list |
| `/admin/loyalty/customers/[id]` | Customer loyalty detail + history + adjust |

Nav: لوحة التحكم · الطلبات · الزبائن · الولاء

## System state

Default config remains **`enabled: false`**.

UI shows:

- «غير مفعّل»
- «نظام الولاء غير مفعّل حالياً، لذلك لا يمكن كسب أو استبدال النقاط.»

Mutations go through `loyalty-service` only. Disabled system rejects with `LOYALTY_DISABLED`.

## Configuration (read-only)

Displays actual fields:

- master `enabled`
- earning enabled + `iqdPerPoint` (IQD per point, may be `0`)
- redemption enabled + minimum + conversion rate (may be `0`)

No economics editor. No invented rates.

## Balance

Derived via `getLoyaltyBalance` / lifetime helpers from **transactions**:

`earn − redeem ± adjust`

UI never mutates `pointsBalance` directly.

## Transactions

Types: اكتساب / استبدال / تعديل  
Sources: طلب / مكافأة / تعديل يدوي  
`reason` is persisted on `LoyaltyTransaction`.

Related order → `/admin/orders/[id]` when `source.order` / `relatedOrderId` exists.

## Manual adjustment

Form: amount (signed integer) + required reason → `adjustPoints()`.

While disabled: controls disabled + clear status message.

Success: «تم تعديل رصيد النقاط» after service succeeds.

## Redemption / earning limitations

- No reward catalog (`redeemReward` remains not_implemented)
- UI states: «استبدال النقاط غير متاح حالياً» · «اكتساب النقاط غير مفعّل حالياً»
- No automatic award from Admin order status changes

## Accounts

- No fake seed balances/transactions
- Demo customers may have **no** loyalty account → «لا يوجد حساب ولاء»
- Accounts created only by existing identity flow (`ensureLoyaltyAccount` on guest resolve)

## Persistence / auth

In-memory only. Refresh clears loyalty data.  
**Admin authentication is implemented** — see [admin-auth.md](./admin-auth.md).

## CRM links

- CRM detail → `/admin/loyalty/customers/[id]`
- Loyalty detail → `/admin/customers/[id]`

## Key files

```text
src/features/loyalty/selectors.ts
src/features/loyalty/use-admin-loyalty.ts
src/lib/format/points.ts
src/components/admin/admin-loyalty-*.tsx
src/app/admin/loyalty/
docs/admin-loyalty.md
```
