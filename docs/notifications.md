# Notifications Foundation — كلشي طيب (Phase 20)

Order communication domain with provider abstraction. **No real WhatsApp/SMS** in this phase.

## Architecture

```text
Order event (checkout / status change)
        ↓
enqueueAndDispatchOrderStatusNotification()
        ↓
Notification row (idempotent)
        ↓
NotificationProvider
        └── MockProvider (default)
```

Real providers (WhatsApp Business API, SMS gateway) plug in later without rewriting order flows.

## Schema

`Notification`:

| Field | Notes |
| --- | --- |
| channel | `WHATSAPP` \| `SMS` |
| type | `ORDER_RECEIVED` … `ORDER_CANCELLED` |
| status | `PENDING` → `SENDING` → `SENT` \| `FAILED` |
| title / body | Arabic snapshot — **no raw phone** |
| idempotencyKey | `orderId:type:channel` (unique) |
| attempts | Incremented on each send attempt |
| provider | `mock` (Phase 20) |

Migration: `prisma/migrations/20260829140000_notifications/`

## Triggers

| Event | Notification type |
| --- | --- |
| Guest checkout success | `ORDER_RECEIVED` |
| Status → confirmed | `ORDER_CONFIRMED` |
| Status → preparing | `ORDER_PREPARING` |
| Status → out_for_delivery | `ORDER_OUT_FOR_DELIVERY` |
| Status → delivered | `ORDER_DELIVERED` |
| Status → cancelled | `ORDER_CANCELLED` |

Notification failures are logged and **do not** roll back order mutations.

## Idempotency

Duplicate status updates / retries reuse the same `idempotencyKey`. Already `SENT` or `SENDING` rows are not dispatched again.

## Providers

| Env | Behavior |
| --- | --- |
| `NOTIFICATION_PROVIDER=mock` (default) | Log safe metadata; mark SENT; never dial |
| Other values | Warned + fall back to mock |

Optional: `NOTIFICATION_DEFAULT_CHANNEL=WHATSAPP` \| `SMS`

## Admin UI

Order detail → **سجل الإشعارات**: type, channel, status, timestamps, attempts, body snapshot.

## Privacy

- No phone in URLs or notification bodies
- Mock logs omit destination phone
- `lastError` redacts `07XXXXXXXXX` patterns

## Retry

`retryNotification(id)` resets FAILED/PENDING and re-dispatches. No job queue yet.

## Limitations

- Mock only — no real customer messages
- No Admin Notification Center
- No bulk retry UI
- No WhatsApp template approval flow

## Next

Phase 21: real WhatsApp provider after vendor selection.
