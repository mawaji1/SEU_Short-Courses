# Manual Deployment Steps - Payment Integration

## Overview
This document outlines all manual steps required to complete the payment integration deployment. All code implementation is complete. These steps involve configuration, registration, and testing.

**Estimated Total Time:** 6-8 hours

---

## Prerequisites

### Required Accounts & Credentials
- ✅ Moyasar merchant account
- ✅ Tabby merchant account
- ✅ Tamara merchant account
- ✅ Access to production servers
- ✅ Database access

### Required Information
- Backend URL (production)
- Frontend URL (production)
- API keys for all providers (test and live)

---

## Step 1: Environment Variables Setup (30 minutes)

### Backend Environment Variables

Create/update `.env` file in backend:

```env
# Moyasar Configuration
MOYASAR_SECRET_KEY=sk_live_xxxxxxxxxx
MOYASAR_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx

# Tabby Configuration
TABBY_API_URL=https://api.tabby.ai/api/v2
TABBY_SECRET_KEY=sk_live_xxxxxxxxxx
TABBY_PUBLIC_KEY=pk_live_xxxxxxxxxx
TABBY_MERCHANT_CODE=your_merchant_code
TABBY_MIN_AMOUNT=100
TABBY_MAX_AMOUNT=10000

# Tamara Configuration
TAMARA_API_URL=https://api.tamara.co
TAMARA_API_TOKEN=your_api_token
TAMARA_NOTIFICATION_TOKEN=your_notification_token
TAMARA_MIN_AMOUNT=100
TAMARA_MAX_AMOUNT=10000

# Application URLs
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
```

### Frontend Environment Variables

Create/update `.env.local` file in frontend:

```env
# Moyasar
NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx

# Tabby
NEXT_PUBLIC_TABBY_PUBLIC_KEY=pk_live_xxxxxxxxxx
NEXT_PUBLIC_TABBY_MERCHANT_CODE=your_merchant_code

# Tamara
NEXT_PUBLIC_TAMARA_PUBLIC_KEY=your_public_key
```

**Important:** Never commit these files to version control!

---

## Step 2: Register Webhooks (30 minutes)

### 2.1 Moyasar Webhook Registration

**Method:** Dashboard

1. **Login to Moyasar Dashboard**
   - URL: https://dashboard.moyasar.com
   - Use your merchant credentials

2. **Navigate to Webhooks**
   - Click "Settings" in sidebar
   - Click "Webhooks"

3. **Add New Webhook**
   - Click "Add Webhook" or "Create Webhook"
   - **URL:** `https://api.your-domain.com/api/payments/webhook`
   - **Events to Subscribe:**
     - ✅ payment_paid
     - ✅ payment_failed
     - ✅ payment_refunded

4. **Save and Test**
   - Click "Save"
   - Use "Test" button to verify endpoint is reachable
   - Check server logs for test webhook delivery

**Verification:**
```bash
# Check server logs
tail -f /var/log/app.log | grep "Moyasar webhook"
```

---

### 2.2 Tabby Webhook Registration

**Method:** API Call

1. **Prepare API Request**

```bash
curl -X POST https://api.tabby.ai/api/v2/webhooks \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.your-domain.com/api/payments/webhooks/tabby",
    "is_test": false,
    "merchant_code": "YOUR_MERCHANT_CODE"
  }'
```

2. **Execute Request**
   - Replace `YOUR_SECRET_KEY` with actual secret key
   - Replace `YOUR_MERCHANT_CODE` with actual merchant code
   - Set `is_test: false` for production
   - Set `is_test: true` for testing

3. **Save Response**
   - Response will contain webhook ID
   - Save this for future reference

4. **Whitelist Tabby IPs (Optional but Recommended)**

Add these IPs to your firewall/security group:
```
34.166.36.90
34.166.35.211
34.166.34.222
34.166.37.207
34.93.76.191
```

**Verification:**
```bash
# Test with a real payment
# Check logs for webhook delivery
tail -f /var/log/app.log | grep "Tabby webhook"
```

---

### 2.3 Tamara Webhook Registration

**Method:** Partner Portal

1. **Login to Tamara Partner Portal**
   - URL: https://partners.tamara.co
   - Use your merchant credentials

2. **Navigate to Webhooks**
   - Click "Webhooks" in left sidebar
   - Click "Add webhooks" button

3. **Configure Webhook**
   - **Type:** Order
   - **Events:** Select at minimum:
     - ✅ Approved (REQUIRED)
     - ✅ Authorized
     - ✅ Declined
     - ✅ Expired
   - **URL:** `https://api.your-domain.com/api/payments/webhooks/tamara`
   - **Headers:** (Optional) Add custom headers if needed

4. **Get Notification Token**
   - After creating webhook, copy the "Notification Token"
   - Add this to backend `.env` as `TAMARA_NOTIFICATION_TOKEN`

5. **Save Configuration**
   - Click "Create Webhook"
   - Verify webhook appears in list

**Verification:**
```bash
# Check server logs
tail -f /var/log/app.log | grep "Tamara webhook"
```

---

## Step 3: Add Widgets to Frontend Pages (2-3 hours)

### 3.1 Product Details Page

**File:** `frontend/src/app/courses/[id]/page.tsx`

**Add imports:**
```typescript
import { TabbyPromoWidget, TamaraWidget } from '@/components/payment';
```

**Add widgets near price display:**
```tsx
{/* Price display */}
<div className="text-3xl font-bold">
  {program.price} SAR
</div>

{/* BNPL Widgets */}
<div className="space-y-2 mt-4">
  <TabbyPromoWidget 
    price={program.price} 
    currency="SAR" 
    language="ar" 
    source="product" 
  />
  
  <TamaraWidget 
    price={program.price} 
    currency="SAR" 
    language="ar" 
    widgetType="product-widget" 
  />
</div>
```

---

### 3.2 Cart Page

**File:** `frontend/src/app/cart/page.tsx`

**Add imports:**
```typescript
import { TabbyPromoWidget, TamaraWidget } from '@/components/payment';
```

**Add widgets near cart total:**
```tsx
{/* Cart Total */}
<div className="text-2xl font-bold">
  Total: {cartTotal} SAR
</div>

{/* BNPL Widgets */}
<div className="space-y-2 mt-4">
  <TabbyPromoWidget 
    price={cartTotal} 
    currency="SAR" 
    language="ar" 
    source="cart" 
  />
  
  <TamaraWidget 
    price={cartTotal} 
    currency="SAR" 
    language="ar" 
    widgetType="cart-widget" 
  />
</div>
```

---

### 3.3 Checkout Page

**File:** `frontend/src/app/checkout/page.tsx`

**Add imports:**
```typescript
import { TabbyCheckoutWidget, TamaraWidget } from '@/components/payment';
```

**Add widgets near payment options:**
```tsx
{/* Payment Options Section */}
<div className="payment-section">
  <h3>Payment Methods</h3>
  
  {/* BNPL Widgets */}
  <div className="space-y-2 mb-4">
    <TabbyCheckoutWidget 
      price={orderTotal} 
      currency="SAR" 
      language="ar" 
    />
    
    <TamaraWidget 
      price={orderTotal} 
      currency="SAR" 
      language="ar" 
      widgetType="checkout-widget" 
    />
  </div>
  
  {/* Existing payment options */}
  <PaymentOptions />
</div>
```

---

## Step 4: Testing (3-4 hours)

### 4.1 Moyasar Testing

**Test Cards:**
- Success: `4111 1111 1111 1111`
- Failure: `4000 0000 0000 0002`

**Test Scenarios:**
1. ✅ Create payment
2. ✅ Complete 3D Secure
3. ✅ Verify webhook delivery
4. ✅ Check payment status in database
5. ✅ Test refund (full and partial)

**Verification Checklist:**
- [ ] Payment created successfully
- [ ] Webhook received and processed
- [ ] Payment status updated to COMPLETED
- [ ] Registration status updated to CONFIRMED
- [ ] Email receipt sent
- [ ] Enrolled count incremented

---

### 4.2 Tabby Testing

**Test Credentials:** Use Tabby test environment

**Test Scenarios:**
1. ✅ Check eligibility (pre-scoring)
2. ✅ Create checkout session
3. ✅ Complete payment at Tabby
4. ✅ Verify "authorized" webhook
5. ✅ Verify automatic capture
6. ✅ Check payment status

**Verification Checklist:**
- [ ] Pre-scoring check works
- [ ] Checkout session created
- [ ] Redirect to Tabby works
- [ ] Webhook received (authorized)
- [ ] Payment captured automatically
- [ ] Payment status updated
- [ ] Registration confirmed
- [ ] Email sent

---

### 4.3 Tamara Testing

**Test Credentials:** Use Tamara sandbox

**Test Scenarios:**
1. ✅ Create checkout session
2. ✅ Complete payment at Tamara
3. ✅ Verify "approved" webhook
4. ✅ Verify authorization API call
5. ✅ Check payment status

**Verification Checklist:**
- [ ] Checkout session created with correct installments
- [ ] Redirect to Tamara works
- [ ] Webhook received (approved)
- [ ] Authorization API called successfully
- [ ] Payment status updated
- [ ] Registration confirmed
- [ ] Email sent

**CRITICAL:** Verify authorization happens automatically after "approved" webhook!

---

### 4.4 Widget Testing

**Test on All Pages:**

1. **Product Page**
   - [ ] Tabby widget displays
   - [ ] Tamara widget displays
   - [ ] Widgets show correct price
   - [ ] Widgets update when price changes
   - [ ] Both Arabic and English work

2. **Cart Page**
   - [ ] Widgets display
   - [ ] Widgets show correct cart total
   - [ ] Widgets update when cart changes

3. **Checkout Page**
   - [ ] Checkout widgets display
   - [ ] Widgets show correct order total
   - [ ] Widgets are responsive

---

## Step 5: Monitoring Setup (1 hour)

### 5.1 Application Logs

**Monitor these logs:**
```bash
# Payment service logs
tail -f /var/log/app.log | grep "Payment"

# Webhook logs
tail -f /var/log/app.log | grep "webhook"

# Error logs
tail -f /var/log/app.log | grep "ERROR"
```

### 5.2 Metrics to Track

**Technical Metrics:**
- Payment success rate (target: >95%)
- Webhook delivery rate (target: >99%)
- API response time (target: <2s)
- Widget load time (target: <1s)

**Business Metrics:**
- Conversion rate by payment method
- Average order value
- Cart abandonment rate
- BNPL adoption rate

### 5.3 Alerts

**Set up alerts for:**
- Webhook delivery failures
- Payment verification failures
- API errors (4xx, 5xx)
- Database connection issues

---

## Step 6: Production Deployment (1 hour)

### 6.1 Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] All webhooks registered
- [ ] All widgets added to pages
- [ ] All tests passed
- [ ] Database migrations run
- [ ] Backup created

### 6.2 Deployment Steps

1. **Deploy Backend**
   ```bash
   # Build
   npm run build
   
   # Deploy
   pm2 restart app
   
   # Verify
   curl https://api.your-domain.com/health
   ```

2. **Deploy Frontend**
   ```bash
   # Build
   npm run build
   
   # Deploy
   # (depends on your hosting)
   
   # Verify
   curl https://your-domain.com
   ```

3. **Verify Webhooks**
   - Create test payment for each provider
   - Verify webhooks are received
   - Check logs for any errors

### 6.3 Post-Deployment Verification

**Smoke Tests:**
1. Visit product page → See widgets
2. Add to cart → See widgets on cart
3. Go to checkout → See checkout widgets
4. Create test payment (small amount)
5. Verify webhook delivery
6. Check database for payment record
7. Verify email sent

---

## Step 7: Go-Live Checklist

### Final Verification

- [ ] All environment variables correct (live keys)
- [ ] All webhooks registered (production URLs)
- [ ] All widgets displaying correctly
- [ ] Test payment completed successfully for each provider
- [ ] Webhooks delivering successfully
- [ ] Email notifications working
- [ ] Monitoring and alerts active
- [ ] Team trained on new system
- [ ] Support documentation ready

### Rollback Plan

If issues occur:
1. Disable new payment methods in UI
2. Revert to previous version
3. Investigate issues
4. Fix and redeploy

---

## Support Contacts

### Moyasar
- Dashboard: https://dashboard.moyasar.com
- Support: [email protected]
- Phone: 800 1111848

### Tabby
- Dashboard: https://merchant.tabby.ai/
- Integration Support: [email protected]
- Technical Support: [email protected]

### Tamara
- Partner Portal: https://partners.tamara.co
- Support: Via partner portal

---

## Troubleshooting

### Webhook Not Receiving

**Check:**
1. URL is correct and accessible
2. HTTPS is enabled
3. Firewall allows provider IPs
4. Server is running
5. Logs for errors

**Solution:**
```bash
# Test endpoint manually
curl -X POST https://api.your-domain.com/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Widget Not Displaying

**Check:**
1. Script loaded correctly
2. Public key is correct
3. Price is valid
4. Console for JavaScript errors

**Solution:**
- Open browser console
- Check for script loading errors
- Verify environment variables

### Payment Verification Failed

**Check:**
1. API keys are correct
2. Amount matches
3. Currency matches
4. Payment ID exists

**Solution:**
- Check logs for specific error
- Verify payment exists in provider dashboard
- Check database for payment record

---

## Completion Checklist

### Configuration
- [ ] Environment variables set (backend)
- [ ] Environment variables set (frontend)
- [ ] Database configured

### Webhooks
- [ ] Moyasar webhook registered
- [ ] Tabby webhook registered
- [ ] Tamara webhook registered
- [ ] All webhooks tested

### Frontend
- [ ] Widgets added to product page
- [ ] Widgets added to cart page
- [ ] Widgets added to checkout page
- [ ] Widgets tested on all pages

### Testing
- [ ] Moyasar end-to-end test passed
- [ ] Tabby end-to-end test passed
- [ ] Tamara end-to-end test passed
- [ ] All widgets displaying correctly

### Monitoring
- [ ] Logs configured
- [ ] Metrics tracking set up
- [ ] Alerts configured

### Deployment
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Production smoke tests passed

### Documentation
- [ ] Team trained
- [ ] Support documentation ready
- [ ] Rollback plan documented

---

## Estimated Timeline

| Task | Time | Status |
|------|------|--------|
| Environment Setup | 30 min | ⏳ |
| Webhook Registration | 30 min | ⏳ |
| Widget Integration | 2-3 hours | ⏳ |
| Testing | 3-4 hours | ⏳ |
| Monitoring Setup | 1 hour | ⏳ |
| Deployment | 1 hour | ⏳ |
| **Total** | **6-8 hours** | ⏳ |

---

## Success Criteria

✅ All three payment providers working in production  
✅ Webhooks delivering successfully (>99% rate)  
✅ Widgets displaying on all pages  
✅ Payment success rate >95%  
✅ No critical errors in logs  
✅ Email notifications working  
✅ Monitoring and alerts active  

---

**Document Version:** 1.0  
**Last Updated:** January 11, 2026  
**Next Review:** After production deployment
