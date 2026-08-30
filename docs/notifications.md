# Notifications — كلشي طيب (Phase 20 + 21 deeplink)

Order communication with provider abstraction. **Phase 21 practical path:** WhatsApp **click-to-chat** (`wa.me`) for kitchen + customer — no Meta Business API required.

## Architecture

```text
Guest checkout success
        ↓
  enqueue mock ORDER_RECEIVED (optional auto path)
        ↓
  Success page CTA → getKitchenOrderWhatsAppLinkAction
        ↓
  wa.me/<KITCHEN_E164>?text=order details  (customer taps Send)
        ↓
  Notification row provider=whatsapp_deeplink (kitchen)

Admin status / detail
        ↓
  getCustomerStatusWhatsAppLinkAction
        ↓
  wa.me/<customer E164>?text=status template
        ↓
  Notification row provider=whatsapp_deeplink (customer)
```

Automated Cloud API / SMS gateways remain future work.

## Schema

`Notification` unchanged. Deeplink rows use:

| Field | Notes |
| --- | --- |
| channel | `WHATSAPP` |
| provider | `whatsapp_deeplink` |
| idempotencyKey | `orderId:type:WHATSAPP:deeplink_kitchen` or `…:deeplink_customer` |
| status | Marked `SENT` when the server issues the `wa.me` URL (guest/staff still must press Send in WhatsApp) |

## Triggers

| Event | Path |
| --- | --- |
| Guest checkout | Mock auto notify (Phase 20) + **kitchen deeplink** on success CTA |
| Admin “افتح واتساب الزبون” | Customer deeplink for **current** order status |
| Status → confirmed…cancelled | Existing mock enqueue (unchanged) |

Notification / deeplink failures **do not** roll back order mutations.

## Env

| Var | Role |
| --- | --- |
| `KITCHEN_WHATSAPP_E164` | Kitchen WhatsApp digits (e.g. `9647XXXXXXXXX`). Omit → hide kitchen CTA |
| `NOTIFICATION_PROVIDER` | Still `mock` for automatic dispatch |
| `NOTIFICATION_DEFAULT_CHANNEL` | `WHATSAPP` \| `SMS` (label for auto path) |

## Admin UI

Order detail:

- **واتساب الزبون** — opens prefilled status message
- **سجل الإشعارات** — shows mock + deeplink rows

## Privacy

- Kitchen message includes customer phone (needed for fulfillment via WhatsApp)
- Customer-facing status templates still avoid embedding the phone in the body text
- Mock logs omit destination phone

## Limitations

- Not server-pushed WhatsApp (no Cloud API)
- Cannot prove the user pressed Send in WhatsApp
- No SMS gateway
- No bulk retry UI

## Next (optional)

Meta WhatsApp Cloud API or Twilio for fully automatic delivery without deeplinks.
