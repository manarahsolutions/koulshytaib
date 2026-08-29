# Loyalty system — كلشي طيب

Phase 10 engine foundation. **Disabled by default.** No customer or Admin UI.

## Identity

```text
LoyaltyAccount.customerId → Customer.id → Orders (via Order.customerId)
```

Loyalty is **not** keyed by phone string. Phone resolves to Customer first (Phase 9).

## Configuration

`DEFAULT_LOYALTY_CONFIG`:

| Field | Default |
| --- | --- |
| `enabled` | `false` |
| `earning.enabled` | `false` |
| `earning.pointsPerCurrencyUnit` | `0` |
| `redemption.enabled` | `false` |
| `redemption.minimumPoints` | `0` |
| `redemption.pointsPerCurrencyUnit` | `0` |

No commercial rates are invented. Keep zeros / disabled until business approval.

## Transaction model

| Type | `points` meaning | Balance effect |
| --- | --- | --- |
| `earn` | positive magnitude | `+points` |
| `redeem` | positive magnitude | `−points` |
| `adjust` | signed integer | `+points` (may be negative) |

Optional `source`:

```ts
{ type: "order", id: orderId }
{ type: "reward", id: rewardId }
{ type: "manual" }
```

`relatedOrderId` remains for Phase 9 compatibility; prefer `source`.

## Balance calculation (source of truth)

```text
balance =
  sum(earn magnitudes)
− sum(redeem magnitudes)
+ sum(adjust signed values)
```

Cached `LoyaltyAccount.pointsBalance` / lifetime fields are **derived** and refreshed after writes. Prefer:

- `getLoyaltyBalance(customerId)`
- `getLifetimeEarned(customerId)`
- `getLifetimeRedeemed(customerId)`
- `getLoyaltyTransactions(customerId)` (newest first)

Negative balance is rejected for redeem and adjust.

## Earning eligibility

Aligned with Phase 9 spend rule:

| Status | Earn? |
| --- | --- |
| `delivered` | ✅ |
| `received` / `confirmed` / `preparing` / `out_for_delivery` | ❌ |
| `cancelled` | ❌ |

`calculateEarnedPoints(order, config)` → integer IQD total × configured rate (or `0` if disabled / rate `0`).

## Order integration boundary

```text
placeGuestOrder()     → status: received  → NO points
…
order becomes delivered (future)
…
awardPointsForDeliveredOrder(order) → earn once
```

Do **not** award on order creation.

## Idempotency

`hasEarnTransactionForOrder(orderId)` / `awardPointsForDeliveredOrder`:

- first call → award (or skip if disabled / ineligible / zero points)
- second call for same order → `already_awarded` (no double credit)

## Redemption

```text
canRedeemPoints(customerId, points)
redeemPoints(customerId, points, reason)
```

Checks: loyalty enabled, redemption enabled, positive integer points, minimum points, sufficient balance.

## Rewards

`LoyaltyReward` model exists. `redeemReward` returns `not_implemented` — does **not** pretend a discount was applied.

## Adjustments

`adjustPoints(customerId, signedPoints, reason)` for future Admin corrections. No Admin UI yet.

## Errors

`LoyaltyError` with codes:

`LOYALTY_DISABLED` · `EARNING_DISABLED` · `REDEMPTION_DISABLED` · `INSUFFICIENT_POINTS` · `INVALID_POINTS` · `ORDER_NOT_ELIGIBLE` · `ALREADY_AWARDED` · `REWARD_NOT_FOUND` · `REWARD_DISABLED` · `NOT_IMPLEMENTED`

## Limitations (explicit)

- No automatic award (order status does not progress via backend yet)
- No reversal automation if a delivered order is later cancelled (use future `adjust`)
- No refunds / payment integration
- No point expiry, birthday/referral/streak bonuses
- No Loyalty UI, CRM dashboard, login, or real database
- In-memory repository only (clears on runtime reload)

## Key files

```text
src/features/loyalty/
  types.ts
  loyalty-repository.ts
  loyalty-rules.ts
  loyalty-metrics.ts
  loyalty-service.ts
```
