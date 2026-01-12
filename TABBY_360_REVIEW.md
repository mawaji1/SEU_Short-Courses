# Tabby Payment Provider - Complete 360° Review

## Documentation Sources
- Main: https://docs.tabby.ai/
- Quick Start: https://docs.tabby.ai/pay-in-4-custom-integration/quick-start
- Checkout Flow: https://docs.tabby.ai/pay-in-4-custom-integration/checkout-flow
- On-Site Messaging: https://docs.tabby.ai/pay-in-4-custom-integration/on-site-messaging
- Payment Processing: https://docs.tabby.ai/pay-in-4-custom-integration/payment-processing
- Webhooks: https://docs.tabby.ai/pay-in-4-custom-integration/webhooks
- Testing Checklist: https://docs.tabby.ai/pay-in-4-custom-integration/full-testing-checklist
- API Reference: https://docs.tabby.ai/api-reference/overview

---

## 1. INTEGRATION OVERVIEW

### What Tabby Is:
- MENA's biggest Buy Now Pay Later (BNPL) service
- Allows customers to split purchases into 4 interest-free installments
- Bi-weekly payment schedule
- Available in UAE, Saudi Arabia, Kuwait

### Integration Flow:
1. **Eligibility Check** → Backend checks customer eligibility via API
2. **Session Creation** → Create Tabby payment session, get Hosted Payment Page URL
3. **Customer Redirection** → Redirect to Tabby's page
4. **Payment Completion** → Tabby processes, redirects back
5. **Order Fulfillment** → Verify payment, fulfill order

**CRITICAL:** Always verify payment status on backend using API or webhooks. Never rely on redirect URLs or query parameters.

---

## 2. STEP-BY-STEP INTEGRATION CHECKLIST

### ✅ Pre-Integration:
- [ ] Register for Tabby merchant account at https://merchant.tabby.ai/
- [ ] Complete application to get access to Merchant Dashboard
- [ ] Retrieve test API keys and merchant codes from dashboard
- [ ] Get merchant code for each store currency (SAR, AED, KWD)

### 🔧 Core Integration:
- [ ] Implement Checkout Flow with eligibility check
- [ ] Integrate Payment Processing on backend
- [ ] Add Tabby promotional messaging (on-site snippets)
- [ ] Implement webhook handlers
- [ ] Test thoroughly with test credentials
- [ ] Share staging site with Tabby Integrations Team for QA

### 🚀 Go-Live:
- [ ] Coordinate marketing campaign with Tabby account manager
- [ ] Request live API keys after approval
- [ ] Deploy to production

---

## 3. ON-SITE MESSAGING (CRITICAL - MISSING)

### Purpose:
Increase customer awareness and conversion rates by showing Tabby payment options throughout the shopping journey.

### Required Snippets:

#### 3.1 Product & Cart Page Snippet

**Where to Place:**
- **Product Page:** Near product price or next to "Add to cart" button
- **Cart Page:** Below total cart amount

**Implementation:**
```html
<!-- Add this div where you want the snippet to appear -->
<div id="TabbyPromo"></div>

<!-- Load Tabby script -->
<script src="https://checkout.tabby.ai/tabby-promo.js"></script>

<!-- Initialize snippet -->
<script>
new TabbyPromo({
  selector: '#TabbyPromo',        // required
  currency: 'SAR',                // required: 'AED' or 'SAR' or 'KWD'
  price: '3500.00',               // required: 2 decimals for AED/SAR, 3 for KWD
  lang: 'ar',                     // optional: 'en' or 'ar'
  source: 'product',              // optional: 'product' or 'cart'
  shouldInheritBg: false,         // optional: true or false
  publicKey: 'pk_test_xxx',       // required: Your public key
  merchantCode: 'your_code'       // required: Based on store currency
});
</script>
```

**Requirements:**
- Must show for ALL products (no amount limitation)
- Must update dynamically when cart changes
- Must support both Arabic and English
- Must be responsive (mobile + desktop)
- Price must be accurate and match actual product/cart price

#### 3.2 Checkout Snippet

**Where to Place:**
- On checkout page near payment method selection

**Implementation:**
```html
<div id="TabbyCard"></div>
<script src="https://checkout.tabby.ai/tabby-card.js"></script>
<script>
new TabbyCard({
  selector: '#TabbyCard',
  currency: 'SAR',
  lang: 'ar',
  price: '3500.00',
  size: 'narrow',                 // 'narrow' or 'wide'
  theme: 'default',               // 'default' or 'black'
  header: true,
  publicKey: 'pk_test_xxx',
  merchantCode: 'your_code'
});
</script>
```

---

## 4. CHECKOUT FLOW

### 4.1 Background Pre-scoring Check (CRITICAL - MISSING)

**Purpose:** Check if customer is eligible BEFORE showing Tabby as payment option.

**API Call:**
```
POST https://api.tabby.ai/api/v2/checkout
```

**Response Handling:**

**Scenario 1: Eligible**
```json
{
  "status": "created",
  "configuration": {
    "available_products": {
      "installments": [...]
    }
  }
}
```
→ **Action:** Show Tabby as payment option

**Scenario 2: Rejected**
```json
{
  "status": "rejected",
  "configuration": {
    "products": {
      "installments": {
        "rejection_reason": "not_available"
      }
    }
  }
}
```

**Rejection Reasons:**
- `not_available` - Customer not eligible
- `order_amount_too_high` - Amount exceeds limit
- `order_amount_too_low` - Amount below minimum

→ **Action:** Hide Tabby or show rejection message

### 4.2 Session Creation

**When:** After customer selects Tabby at checkout

**Required Parameters:**
```json
{
  "payment": {
    "amount": "3500.00",
    "currency": "SAR",
    "description": "Order #12345"
  },
  "lang": "ar",                    // REQUIRED: 'ar' or 'en'
  "merchant_code": "your_code",
  "merchant_urls": {
    "success": "https://yoursite.com/payment/success",
    "cancel": "https://yoursite.com/payment/cancel",
    "failure": "https://yoursite.com/payment/failure"
  },
  "order": {
    "reference_id": "order_12345",
    "items": [...]
  },
  "buyer": {
    "email": "customer@example.com",
    "phone": "+966500000000",
    "name": "Customer Name"
  }
}
```

**Response:**
```json
{
  "id": "session_id",
  "payment": {
    "id": "payment_id"           // SAVE THIS - needed for verification
  },
  "configuration": {
    "available_products": {
      "installments": [{
        "web_url": "https://checkout.tabby.ai/..."  // Redirect here
      }]
    }
  }
}
```

### 4.3 Redirect URLs & Error Messages

**Success URL:**
- Status: `AUTHORIZED`
- Action: Verify payment via API, then fulfill order

**Cancel URL:**
- Status: `EXPIRED`
- Message: "You aborted the payment. Please retry or choose another payment method." / "لقد ألغيت الدفعة. فضلاً حاول مجددًا أو اختر طريقة دفع أخرى."

**Failure URL:**
- Status: `REJECTED`
- Message: "Sorry, Tabby is unable to approve this purchase. Please use an alternative payment method" / "نأسف، تابي غير قادرة على الموافقة على هذه العملية. الرجاء استخدام طريقة دفع أخرى."

---

## 5. PAYMENT PROCESSING

### 5.1 Payment Verification (CRITICAL)

**After redirect, you MUST verify payment status:**

**Method 1: Webhooks (Recommended)**
- Receive webhook with status `"authorized"` (lowercase)
- Verify authenticity using auth header
- Return 200 status code

**Method 2: API Call**
```
GET https://api.tabby.ai/api/v2/payments/{payment_id}
```
- Returns status `"AUTHORIZED"` (uppercase)
- Use `payment_id` from session creation

**NEVER trust redirect URLs alone!**

### 5.2 Payment Capture (REQUIRED)

**When:** After verifying status is `AUTHORIZED`

**API Call:**
```
POST https://api.tabby.ai/api/v2/payments/{payment_id}/captures
```

**Body:**
```json
{
  "amount": "3500.00"  // Must capture full amount
}
```

**Important:**
- Must capture within 30 days of authorization
- Partial captures not supported (must be full amount)
- After capture, payment status becomes `CLOSED`

### 5.3 Payment Refund

**API Call:**
```
POST https://api.tabby.ai/api/v2/payments/{payment_id}/refunds
```

**Body:**
```json
{
  "amount": "3500.00",
  "reason": "Customer request"
}
```

---

## 6. WEBHOOKS (CRITICAL - MISSING)

### 6.1 Registration (One-time per merchant_code)

**API Call:**
```
POST https://api.tabby.ai/api/v2/webhooks
```

**Body:**
```json
{
  "url": "https://yoursite.com/api/webhooks/tabby",
  "is_test": true,              // true for test keys, false for live
  "merchant_code": "your_code"
}
```

**Optional:** Add `auth_header` for request signing

### 6.2 Webhook Events

**Event 1: Payment Authorized**
```json
{
  "status": "authorized",        // lowercase
  "id": "payment_id",
  "amount": "3500",
  "currency": "SAR"
}
```
→ **Action:** Verify order status, send capture request

**Event 2: Payment Captured**
```json
{
  "status": "authorized",        // still lowercase
  "captures": [...]
}
```
→ **Action:** No action needed

**Event 3: Payment Closed**
```json
{
  "status": "closed"             // lowercase
}
```
→ **Action:** No action needed (payment complete)

### 6.3 Webhook Security

**Must implement:**
- Return 200 HTTP status to confirm receipt
- Verify auth header if configured
- Whitelist Tabby IPs:
  - 34.166.36.90
  - 34.166.35.211
  - 34.166.34.222
  - 34.166.37.207
  - 34.93.76.191

**Handle edge cases:**
- Webhooks may arrive out of order
- May receive duplicate webhooks (idempotency)
- Filter and process only needed events

---

## 7. TESTING REQUIREMENTS

### 7.1 On-Site Messaging Tests
- [ ] Product snippets show for all products
- [ ] Cart snippet shows for all amounts
- [ ] Snippets update when cart changes
- [ ] Both Arabic and English work
- [ ] Mobile and desktop responsive
- [ ] Correct country filtering

### 7.2 Payment Method Tests
- [ ] Tabby logo displays correctly
- [ ] No restrictions from our side (pre-scoring handles it)
- [ ] Both languages work
- [ ] Country filtering works

### 7.3 Checkout Tests
- [ ] Background pre-scoring works
- [ ] Language parameter sent correctly
- [ ] All required API parameters included
- [ ] Success scenario works
- [ ] Cancellation scenario works
- [ ] Failure scenario works
- [ ] Corner cases handled

### 7.4 Payment Processing Tests
- [ ] Webhooks registered correctly
- [ ] Webhook handler returns 200
- [ ] Payment verification works
- [ ] Capture request succeeds
- [ ] Full amount captured

---

## 8. CURRENT IMPLEMENTATION GAPS

### ❌ MISSING - Critical:
1. **On-site messaging** - No product/cart snippets
2. **Background pre-scoring** - Not checking eligibility before showing Tabby
3. **Webhook handlers** - Not implemented
4. **Language support** - Not sending `lang` parameter
5. **Proper error messages** - Generic errors instead of specific messages
6. **Payment verification** - Relying on redirects, not API verification
7. **Testing** - No systematic testing done

### ⚠️ PARTIAL - Needs Work:
1. **Session creation** - Basic flow works but missing parameters
2. **Payment capture** - Implemented but not properly triggered
3. **Logo display** - Using text instead of official logo

### ✅ IMPLEMENTED:
1. Basic checkout flow
2. Payment creation API call
3. Redirect handling (but not verified)

---

## 9. IMPLEMENTATION PRIORITY

### Phase 1 - Critical (Must Have):
1. Implement webhook registration and handlers
2. Add payment verification via API
3. Implement proper payment capture flow
4. Add language parameter to session creation
5. Add background pre-scoring check

### Phase 2 - Important (Should Have):
1. Add on-site messaging (product/cart snippets)
2. Implement proper error messages
3. Add official Tabby logo
4. Add checkout snippet

### Phase 3 - Testing:
1. Test all scenarios with test credentials
2. Share with Tabby team for QA
3. Fix any issues found
4. Get approval for production

---

## 10. CONTACT & SUPPORT

- **Integration Support:** [email protected]
- **Technical Support:** [email protected]
- **Merchant Dashboard:** https://merchant.tabby.ai/
- **Documentation:** https://docs.tabby.ai/

---

## SUMMARY

**Current Status:** ~20% complete
**Production Ready:** NO
**Estimated Work:** 3-5 days for complete implementation

**Critical Missing Features:**
- Webhooks (payment verification broken without this)
- On-site messaging (conversion optimization)
- Pre-scoring (showing Tabby to ineligible customers)
- Proper error handling
- Systematic testing

**Next Steps:**
1. Review this document completely
2. Implement Phase 1 features
3. Test thoroughly
4. Move to Phase 2
5. Get Tabby team approval
6. Go live
