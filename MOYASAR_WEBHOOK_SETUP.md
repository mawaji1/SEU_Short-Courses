# Moyasar Webhook Setup Guide

## Purpose
Register webhook endpoint to receive real-time payment notifications from Moyasar.

---

## Step 1: Login to Moyasar Dashboard

1. Go to: https://dashboard.moyasar.com
2. Login with your credentials
3. Ensure you're in the correct mode (Test or Live)

---

## Step 2: Navigate to Webhooks Settings

1. Click on **Settings** in the left sidebar
2. Click on **Webhooks**
3. Click **Add Webhook** or **Create Webhook**

---

## Step 3: Configure Webhook

### Webhook URL:
```
Production: https://your-domain.com/api/payments/webhook
Development: https://your-dev-domain.com/api/payments/webhook
Local Testing: Use ngrok or similar tunnel service
```

### Events to Subscribe:
Select the following events:
- ✅ **payment_paid** - Payment successful
- ✅ **payment_failed** - Payment failed
- ✅ **payment_refunded** - Payment refunded

### Optional: Add Secret (Recommended for Production)
- Generate a random secret key
- Add to environment variables: `MOYASAR_WEBHOOK_SECRET`
- Use for signature verification (future enhancement)

---

## Step 4: Test Webhook

### Using Moyasar Dashboard:
1. Go to **Webhooks** section
2. Find your registered webhook
3. Click **Test** or **Send Test Event**
4. Verify your endpoint receives the test payload

### Using Test Payment:
1. Create a test payment using test card
2. Complete the payment
3. Check your server logs for webhook delivery
4. Verify payment status updated in database

---

## Step 5: Monitor Webhook Delivery

### In Moyasar Dashboard:
- View webhook delivery history
- Check success/failure rates
- Retry failed webhooks manually if needed

### In Your Application:
- Check server logs for webhook processing
- Monitor payment status updates
- Set up alerts for webhook failures

---

## Webhook Payload Examples

### payment_paid Event:
```json
{
  "id": "webhook_id",
  "type": "payment_paid",
  "created_at": "2026-01-11T20:00:00.000Z",
  "data": {
    "id": "payment_id",
    "status": "paid",
    "amount": 350000,
    "currency": "SAR",
    "description": "Course Registration",
    "source": {
      "type": "creditcard",
      "company": "mada",
      "name": "Customer Name",
      "number": "424242xxxxxx4242"
    }
  }
}
```

### payment_failed Event:
```json
{
  "id": "webhook_id",
  "type": "payment_failed",
  "created_at": "2026-01-11T20:00:00.000Z",
  "data": {
    "id": "payment_id",
    "status": "failed",
    "amount": 350000,
    "currency": "SAR"
  }
}
```

### payment_refunded Event:
```json
{
  "id": "webhook_id",
  "type": "payment_refunded",
  "created_at": "2026-01-11T20:00:00.000Z",
  "data": {
    "id": "payment_id",
    "status": "refunded",
    "amount": 350000,
    "refunded": 350000,
    "currency": "SAR"
  }
}
```

---

## Troubleshooting

### Webhook Not Receiving:
1. Check webhook URL is correct and accessible
2. Verify HTTPS is enabled (required for production)
3. Check firewall/security group allows Moyasar IPs
4. Test endpoint manually with curl

### Webhook Failing:
1. Check server logs for errors
2. Verify endpoint returns 200 status
3. Check database connectivity
4. Verify payment exists in database

### Duplicate Webhooks:
- Our implementation handles idempotency automatically
- Duplicate webhooks are detected and skipped
- Check logs for "already_processed" messages

---

## Security Best Practices

1. **Use HTTPS** - Required for production
2. **Verify Webhook Signature** - Implement signature verification
3. **Validate Payload** - Check payment exists before processing
4. **Return 200 Quickly** - Process asynchronously
5. **Log Everything** - Monitor webhook delivery and processing
6. **Handle Retries** - Moyasar retries 5 times on failure

---

## Current Implementation Status

✅ **Webhook endpoint created:** `/api/payments/webhook`
✅ **Idempotency handling:** Prevents duplicate processing
✅ **Async processing:** Returns 200 immediately
✅ **Event handling:** payment_paid, payment_failed, payment_refunded
✅ **Error handling:** Comprehensive logging and error recovery
✅ **Logging:** Detailed logs for debugging

⏳ **Pending:** Register webhook in Moyasar Dashboard
⏳ **Future:** Add webhook signature verification

---

## Next Steps

1. Register webhook in Moyasar Dashboard (Test mode first)
2. Test with test payment
3. Verify webhook delivery in logs
4. Register webhook in production when ready
5. Monitor webhook delivery rates
