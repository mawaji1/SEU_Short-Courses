# Moyasar Payment Gateway - Complete 360° Review

## Documentation Sources
- Main Docs: https://docs.moyasar.com/
- Basic Integration: https://docs.moyasar.com/guides/card-payments/basic-integration
- API Reference: https://docs.moyasar.com/api/api-introduction
- Authentication: https://docs.moyasar.com/api/authentication
- Create Payment: https://docs.moyasar.com/api/payments/01-create-payment
- Refund Payment: https://docs.moyasar.com/api/payments/05-refund-payment
- Webhooks: https://docs.moyasar.com/api/other/webhooks/webhook-reference
- Dashboard: https://dashboard.moyasar.com

---

## 1. INTEGRATION OVERVIEW

### What Moyasar Is:
- Saudi-based payment gateway
- Supports: mada, Visa, Mastercard, American Express, Apple Pay, STC Pay
- Direct card payments (not BNPL)
- Available in Saudi Arabia and other GCC countries
- Supports multiple currencies (SAR, AED, KWD, etc.)

### Integration Approach:
**Two Options:**

**Option 1: Moyasar Form (Recommended - What we're using)**
- JavaScript library that creates payment form
- Handles 3D Secure automatically
- Modern, responsive design
- Minimal backend code

**Option 2: Custom Implementation**
- Build your own payment form
- Call Moyasar API directly
- Full control over UI
- More complex implementation

### Payment Flow (Moyasar Form):
1. **Include Moyasar Form** → Load JavaScript library
2. **Initialize Form** → Configure with amount, currency, API key
3. **Customer Pays** → Form handles card input and 3D Secure
4. **Redirect Back** → Customer redirected to callback URL with payment ID
5. **Verify Payment** → Backend fetches payment details and verifies status

**CRITICAL:** Always verify payment on backend. Never trust redirect parameters alone.

---

## 2. STEP-BY-STEP INTEGRATION CHECKLIST

### ✅ Pre-Integration:
- [ ] Sign up at https://dashboard.moyasar.com/register/new
- [ ] Get API keys from dashboard (test and live)
- [ ] Understand test vs live modes
- [ ] Review supported payment methods

### 🔧 Core Integration:
- [ ] Include Moyasar Form JavaScript library
- [ ] Initialize payment form with correct configuration
- [ ] Implement callback URL handler
- [ ] Implement payment verification on backend
- [ ] Register webhooks in dashboard
- [ ] Implement webhook handler
- [ ] Test with test cards
- [ ] Switch to live API keys

### 🚀 Go-Live:
- [ ] Use live API keys
- [ ] Update webhook URLs to production
- [ ] Monitor payments in dashboard

---

## 3. AUTHENTICATION

### API Keys:

**Two Types:**
1. **Publishable Key** (`pk_test_...` or `pk_live_...`)
   - Used in frontend/JavaScript
   - Safe to expose publicly
   - Used for Moyasar Form initialization

2. **Secret Key** (`sk_test_...` or `sk_live_...`)
   - Used in backend API calls
   - MUST be kept secret
   - Used for payment verification, refunds, etc.

### Test vs Live Mode:

**Test Mode:**
- API keys prefixed with `test`
- No real money charged
- Simulates payment network responses
- Use test cards for testing

**Live Mode:**
- API keys prefixed with `live`
- Real money transactions
- Actual banking network integration

### Authentication Method:

**HTTP Basic Auth:**
```
Authorization: Basic base64(secret_key:)
```

Note: Username is the secret key, password is empty.

---

## 4. MOYASAR FORM INTEGRATION (CURRENT IMPLEMENTATION)

### 4.1 Include Moyasar Form

**Add to `<head>` tag:**
```html
<link rel="stylesheet" href="https://cdn.moyasar.com/mpf/1.14.0/moyasar.css" />
<script src="https://cdn.moyasar.com/mpf/1.14.0/moyasar.js"></script>
```

### 4.2 Initialize Payment Form

**HTML:**
```html
<div class="mysr-form"></div>
```

**JavaScript:**
```javascript
Moyasar.init({
  element: '.mysr-form',
  
  // Amount in smallest currency unit (Halalas for SAR)
  // 3500 SAR = 350000 Halalas
  amount: 350000,
  
  currency: 'SAR',
  
  description: 'Course Registration - Order #12345',
  
  // Publishable key (safe for frontend)
  publishable_api_key: 'pk_test_xxx',
  
  // Redirect URL after payment
  callback_url: 'https://yoursite.com/payment/callback',
  
  // Supported card networks
  supported_networks: ['visa', 'mastercard', 'mada'],
  
  // Payment methods
  methods: ['creditcard'],  // Can also include 'applepay', 'stcpay'
  
  // Optional: Save payment ID before 3D Secure redirect
  on_completed: async function(payment) {
    await savePaymentOnBackend(payment);
  }
});
```

### 4.3 Configuration Keys

**Required:**
- `element` - CSS selector for form container
- `amount` - Amount in smallest unit (Halalas for SAR, Fils for KWD)
- `currency` - ISO 4217 code (SAR, AED, KWD, etc.)
- `publishable_api_key` - Your publishable key
- `callback_url` - Where to redirect after payment

**Optional but Recommended:**
- `description` - Payment description
- `supported_networks` - Limit card types
- `methods` - Payment methods to show
- `on_completed` - Save payment ID before redirect
- `metadata` - Custom data to attach to payment

### 4.4 Amount Calculation

**CRITICAL:** Amount must be in smallest currency unit!

**Examples:**
- SAR: 3500 SAR = 350000 Halalas (multiply by 100)
- KWD: 3500 KWD = 3500000 Fils (multiply by 1000)
- JPY: 3500 JPY = 3500 (no fractions)

**Formula:**
```javascript
// For SAR
const amountInHalalas = priceInSAR * 100;

// For KWD
const amountInFils = priceInKWD * 1000;
```

---

## 5. PAYMENT VERIFICATION (CRITICAL)

### 5.1 Callback URL Handling

**After payment, user is redirected to:**
```
https://yoursite.com/payment/callback?id=79cced57-9deb-4c4b-8f48-59c124f79688
```

**Extract payment ID from query parameter:**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const paymentId = urlParams.get('id');
```

### 5.2 Fetch Payment Details

**API Endpoint:**
```
GET https://api.moyasar.com/v1/payments/{payment_id}
```

**Authentication:**
```
Authorization: Basic base64(sk_test_xxx:)
```

**Response:**
```json
{
  "id": "79cced57-9deb-4c4b-8f48-59c124f79688",
  "status": "paid",           // or "initiated", "failed"
  "amount": 350000,
  "fee": 5250,
  "currency": "SAR",
  "refunded": 0,
  "captured": 350000,
  "description": "Course Registration",
  "source": {
    "type": "creditcard",
    "company": "mada",
    "name": "Customer Name",
    "number": "424242xxxxxx4242"
  },
  "created_at": "2026-01-11T08:00:00.000Z"
}
```

### 5.3 Verification Steps

**MUST verify:**
1. **Status** - Must be `"paid"`
2. **Amount** - Must match expected amount
3. **Currency** - Must match expected currency
4. **Payment ID** - Must exist in your database

**Example verification:**
```javascript
async function verifyPayment(paymentId, expectedAmount, expectedCurrency) {
  const payment = await fetchPaymentFromMoyasar(paymentId);
  
  if (payment.status !== 'paid') {
    throw new Error('Payment not completed');
  }
  
  if (payment.amount !== expectedAmount) {
    throw new Error('Amount mismatch');
  }
  
  if (payment.currency !== expectedCurrency) {
    throw new Error('Currency mismatch');
  }
  
  return payment;
}
```

**NEVER trust redirect alone - always verify on backend!**

---

## 6. PAYMENT STATUSES

### Status Flow:

**1. `initiated`**
- Payment created but not completed
- Customer needs to complete 3D Secure
- Redirect to `source.transaction_url`

**2. `paid`**
- Payment successful
- Amount captured
- Order can be fulfilled

**3. `failed`**
- Payment failed
- Customer not charged
- Show error message

**4. `authorized`**
- Payment authorized but not captured
- Used for two-step payments
- Must call capture API

**5. `captured`**
- Payment captured after authorization
- Amount settled

**6. `refunded`**
- Payment refunded to customer
- Full or partial refund

**7. `voided`**
- Payment voided before capture
- No money transferred

---

## 7. WEBHOOKS (RECOMMENDED)

### 7.1 Why Webhooks?

**Benefits:**
- Real-time payment notifications
- Handles connection drops
- Asynchronous payment updates
- Reliable payment confirmation

### 7.2 Available Events

- `payment_paid` - Payment successful
- `payment_failed` - Payment failed
- `payment_refunded` - Payment refunded
- `payment_voided` - Payment voided
- `payment_authorized` - Payment authorized
- `payment_captured` - Payment captured
- `payment_verified` - Payment verified

### 7.3 Register Webhook

**Where:** Moyasar Dashboard → Settings → Webhooks

**Configuration:**
- **URL:** Your webhook endpoint (HTTPS required)
- **Events:** Select events to receive
- **Secret:** Optional signing secret

### 7.4 Webhook Handler

**Webhook Payload:**
```json
{
  "id": "webhook_id",
  "type": "payment_paid",
  "created_at": "2026-01-11T08:00:00.000Z",
  "data": {
    "id": "payment_id",
    "status": "paid",
    "amount": 350000,
    "currency": "SAR",
    // ... full payment object
  }
}
```

**Handler Requirements:**
1. Return 2xx status code quickly
2. Process logic asynchronously
3. Handle duplicate webhooks (idempotency)
4. Verify webhook signature (if configured)

**Example Handler:**
```javascript
app.post('/webhooks/moyasar', async (req, res) => {
  // Return 200 immediately
  res.status(200).send('OK');
  
  // Process asynchronously
  const webhook = req.body;
  
  if (webhook.type === 'payment_paid') {
    const payment = webhook.data;
    await processPayment(payment);
  }
});
```

### 7.5 Retry Strategy

**If webhook fails (non-2xx response):**
- Moyasar retries 5 times
- Then drops the message

**Must handle:**
- Duplicate webhooks
- Out-of-order webhooks
- Idempotency

---

## 8. REFUNDS

### 8.1 Refund API

**API Endpoint:**
```
POST https://api.moyasar.com/v1/payments/{payment_id}/refund
```

**Authentication:**
```
Authorization: Basic base64(sk_test_xxx:)
```

**Body (Full Refund):**
```json
{
  // Empty body for full refund
}
```

**Body (Partial Refund):**
```json
{
  "amount": 100000  // Amount in smallest unit (1000 SAR)
}
```

**Response:**
```json
{
  "id": "payment_id",
  "status": "refunded",
  "amount": 350000,
  "refunded": 100000,  // Amount refunded
  "currency": "SAR"
}
```

### 8.2 Refund Rules

- Can refund full or partial amount
- Partial refunds can be done multiple times
- Total refunds cannot exceed payment amount
- Refunds processed immediately
- Customer receives refund in 5-10 business days

---

## 9. TESTING

### 9.1 Test Cards

**Successful Payment:**
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
```

**Failed Payment:**
```
Card Number: 4000 0000 0000 0002
Expiry: Any future date
CVV: Any 3 digits
```

**3D Secure:**
- Test cards trigger 3D Secure flow
- Use any OTP code in test mode

### 9.2 Test Checklist

- [ ] Payment form displays correctly
- [ ] Card validation works
- [ ] 3D Secure flow works
- [ ] Successful payment redirects correctly
- [ ] Failed payment shows error
- [ ] Payment verification works on backend
- [ ] Webhooks received correctly
- [ ] Refunds work
- [ ] Amount calculations correct (Halalas)

---

## 10. CURRENT IMPLEMENTATION STATUS

### ✅ IMPLEMENTED:
1. Moyasar Form integration
2. Payment form initialization
3. Basic redirect handling
4. Payment creation

### ⚠️ NEEDS VERIFICATION:
1. **Amount calculation** - Verify using Halalas (multiply by 100)
2. **Payment verification** - Ensure backend verifies status/amount
3. **Error handling** - Handle failed payments properly
4. **Callback URL** - Verify correct URL configuration

### ❌ MISSING:
1. **Webhooks** - Not registered in dashboard
2. **Webhook handler** - Not implemented
3. **Refund functionality** - Not implemented
4. **Payment status tracking** - Limited implementation
5. **Test mode verification** - Need to verify test keys used

---

## 11. IMPLEMENTATION PRIORITY

### Phase 1 - Verify Current Implementation:
1. Check amount calculation (SAR to Halalas)
2. Verify payment verification logic
3. Test with test cards
4. Verify callback URL handling
5. Check error handling

### Phase 2 - Add Missing Features:
1. Register webhooks in dashboard
2. Implement webhook handler
3. Add refund functionality
4. Improve payment status tracking
5. Add better error messages

### Phase 3 - Testing:
1. Test all payment scenarios
2. Test webhooks
3. Test refunds
4. Verify amounts correct
5. Test error cases

---

## 12. KEY DIFFERENCES FROM TABBY/TAMARA

**Moyasar is simpler:**
- ✅ No pre-scoring check required
- ✅ No authorization step (direct capture)
- ✅ No widgets/on-site messaging needed
- ✅ Simpler payment flow
- ✅ Fewer API calls

**But requires:**
- ⚠️ Careful amount calculation (Halalas)
- ⚠️ Backend payment verification
- ⚠️ Webhook handling for reliability
- ⚠️ Proper error handling

**Not BNPL:**
- Direct card payment (not installments)
- Immediate capture
- No customer eligibility checks

---

## 13. COMMON PITFALLS

### 1. Amount Calculation Error
**Wrong:**
```javascript
amount: 3500  // This is 35 SAR, not 3500 SAR!
```

**Correct:**
```javascript
amount: 3500 * 100  // 350000 Halalas = 3500 SAR
```

### 2. Not Verifying Payment
**Wrong:**
```javascript
// Trusting redirect alone
if (paymentId) {
  fulfillOrder();  // DANGEROUS!
}
```

**Correct:**
```javascript
const payment = await fetchPayment(paymentId);
if (payment.status === 'paid' && payment.amount === expectedAmount) {
  fulfillOrder();
}
```

### 3. Using Wrong API Key
**Wrong:**
```javascript
// Using secret key in frontend
publishable_api_key: 'sk_test_xxx'  // SECURITY RISK!
```

**Correct:**
```javascript
// Frontend: Publishable key
publishable_api_key: 'pk_test_xxx'

// Backend: Secret key
Authorization: Basic base64(sk_test_xxx:)
```

### 4. Not Handling Webhooks
- Connection drops during redirect
- Payment succeeds but user not redirected
- No notification of payment status

**Solution:** Always implement webhooks

---

## 14. CONTACT & SUPPORT

- **Dashboard:** https://dashboard.moyasar.com
- **Documentation:** https://docs.moyasar.com
- **Support Phone:** 800 1111848
- **Help Desk:** https://help.moyasar.com

---

## SUMMARY

**Current Status:** ~60% complete
**Production Ready:** MAYBE (needs verification)
**Estimated Work:** 1-2 days to complete and verify

**What's Working:**
- Basic Moyasar Form integration
- Payment creation
- Redirect handling

**What Needs Verification:**
- Amount calculation (Halalas)
- Payment verification logic
- Error handling
- Test mode usage

**What's Missing:**
- Webhooks (important for reliability)
- Refund functionality
- Comprehensive testing

**Next Steps:**
1. Verify amount calculation
2. Verify payment verification
3. Register and implement webhooks
4. Add refund functionality
5. Test thoroughly with test cards
6. Switch to live keys for production
