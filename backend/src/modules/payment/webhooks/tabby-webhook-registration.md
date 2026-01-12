# Tabby Webhook Registration Guide

## Step 1: Register Webhook via API

**Endpoint:** `POST https://api.tabby.ai/api/v2/webhooks`

**Headers:**
```
Authorization: Bearer YOUR_SECRET_KEY
Content-Type: application/json
```

**Body:**
```json
{
  "url": "https://your-domain.com/api/payments/webhooks/tabby",
  "is_test": true,
  "merchant_code": "YOUR_MERCHANT_CODE"
}
```

**Important:**
- Use `is_test: true` for test environment
- Use `is_test: false` for production
- Register once per merchant_code
- URL must be HTTPS (required)

---

## Step 2: Whitelist Tabby IPs (Optional but Recommended)

Add these IPs to your firewall/security group:
```
34.166.36.90
34.166.35.211
34.166.34.222
34.166.37.207
34.93.76.191
```

---

## Step 3: Test Webhook

### Using cURL:
```bash
curl -X POST https://api.tabby.ai/api/v2/webhooks \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/payments/webhooks/tabby",
    "is_test": true,
    "merchant_code": "YOUR_MERCHANT_CODE"
  }'
```

### Expected Response:
```json
{
  "id": "webhook_id",
  "url": "https://your-domain.com/api/payments/webhooks/tabby",
  "is_test": true,
  "merchant_code": "YOUR_MERCHANT_CODE",
  "created_at": "2026-01-11T22:00:00Z"
}
```

---

## Step 4: Verify Webhook Delivery

1. Create a test payment
2. Complete the payment flow
3. Check server logs for webhook delivery:
   ```
   [PaymentModule] Received Tabby webhook: payment_xxx, status: authorized
   [TabbyWebhookService] Processing Tabby webhook: payment_xxx, status: authorized
   [TabbyWebhookService] Payment payment_xxx authorized and confirmed
   ```

---

## Webhook Events

Your endpoint will receive these events:
- `authorized` - Payment authorized (triggers capture)
- `closed` - Payment captured and completed
- `expired` - Session expired
- `rejected` - Payment rejected

---

## Current Implementation Status

✅ Webhook endpoint: `/api/payments/webhooks/tabby`
✅ Idempotency handling
✅ Async processing
✅ Payment verification
✅ Automatic capture
✅ Error handling

⏳ **Action Required:** Register webhook URL in Tabby system
