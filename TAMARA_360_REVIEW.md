# Tamara Payment Provider - Complete 360° Review

## Documentation Sources
- Main Hub: https://docs.tamara.co/
- Online Checkout: https://docs.tamara.co/docs/direct-online-checkout
- Widget Guidelines (KSA): https://docs.tamara.co/docs/tamara-widget-implementation-guidelines-saudi-arabia
- Widgets Documentation: https://docs.tamara.co/docs/direct-widgets
- Webhook Registration: https://docs.tamara.co/docs/transaction-authorisation
- API Reference: https://docs.tamara.co/reference/tamara-api-reference-documentation
- Create Checkout: https://docs.tamara.co/reference/createcheckoutsession
- Testing Guide: https://docs.tamara.co/docs/testing-scenarios

---

## 1. INTEGRATION OVERVIEW

### What Tamara Is:
- Leading Buy Now Pay Later (BNPL) service in Saudi Arabia and GCC
- Allows customers to split purchases into installments
- Payment options: Pay in 3, 4, 6, or up to 12 installments
- Interest-free payments
- Available in Saudi Arabia, UAE, Kuwait

### Integration Flow:
1. **Display Widgets** → Show Tamara on product/cart/checkout pages
2. **Create Checkout Session** → Customer selects Tamara, create session via API
3. **Customer Redirection** → Redirect to Tamara checkout page
4. **Webhook Notification** → Receive "approved" notification
5. **Authorize Order** → Call Authorize API to confirm
6. **Capture Payment** → After shipping, call Capture API

**CRITICAL:** Must register webhooks and call Authorize API after receiving "approved" notification.

---

## 2. STEP-BY-STEP INTEGRATION CHECKLIST

### ✅ Pre-Integration:
- [ ] Sign up for Tamara merchant account
- [ ] Receive API Token, Notification Token, and Public Key
- [ ] Access Partner Portal: https://partners.tamara.co
- [ ] Get sandbox credentials for testing

### 🔧 Core Integration:
- [ ] Implement widgets (PDP, Cart, Checkout)
- [ ] Implement checkout session creation
- [ ] Register webhook URL in Partner Portal
- [ ] Implement webhook handler
- [ ] Implement Authorize Order API call
- [ ] Implement Capture Order API call
- [ ] Test with sandbox credentials
- [ ] Request live credentials

### 🚀 Go-Live:
- [ ] Switch to production API endpoint
- [ ] Use live API token
- [ ] Register production webhook
- [ ] Deploy to production

---

## 3. WIDGETS (CRITICAL - MISSING)

### Purpose:
Inform customers that Tamara is available throughout their shopping journey. Increases conversion and average order value.

### 3.1 Product Details Page (PDP) Widget

**Purpose:** Show payment options when customer is considering purchase

**Where to Place:**
- Near product price
- Above or below "Add to Cart" button
- Visible without scrolling (recommended)

**Implementation:**
```html
<div id="tamara-product-widget"></div>

<script src="https://cdn.tamara.co/widget-v2/tamara-widget.js"></script>
<script>
window.tamaraWidgetConfig = {
  lang: 'ar',                    // 'ar' or 'en'
  country: 'SA',                 // 'SA', 'AE', 'KW'
  publicKey: 'your_public_key',
  amount: 3500.00,               // Product price
  currency: 'SAR',
  widgetType: 'product-widget'
};
</script>
```

**Requirements:**
- Must show for ALL products
- Must update when price changes
- Must support both Arabic and English
- Must be responsive
- Logo must be visible

### 3.2 Cart Widget

**Purpose:** Reinforce Tamara availability as customer reviews cart

**Where to Place:**
- Below cart total
- Near checkout button

**Implementation:**
```html
<div id="tamara-cart-widget"></div>

<script src="https://cdn.tamara.co/widget-v2/tamara-widget.js"></script>
<script>
window.tamaraWidgetConfig = {
  lang: 'ar',
  country: 'SA',
  publicKey: 'your_public_key',
  amount: 3500.00,               // Cart total
  currency: 'SAR',
  widgetType: 'cart-widget'
};
</script>
```

**Requirements:**
- Must update dynamically when cart changes
- Must show accurate cart total
- Must handle currency correctly

### 3.3 Checkout Widget

**Purpose:** Final confirmation that Tamara is available

**Where to Place:**
- Near payment method selection
- On checkout page

**Implementation:**
```html
<div id="tamara-checkout-widget"></div>

<script src="https://cdn.tamara.co/widget-v2/tamara-widget.js"></script>
<script>
window.tamaraWidgetConfig = {
  lang: 'ar',
  country: 'SA',
  publicKey: 'your_public_key',
  amount: 3500.00,               // Order total
  currency: 'SAR',
  widgetType: 'checkout-widget'
};
</script>
```

### 3.4 Widget Guidelines

**Logo Requirements:**
- Use NEW refreshed Tamara logo (not old version)
- Logo is preferred over text-only
- Must be visible and recognizable

**Messaging Requirements:**
- Show installment options clearly
- Display accurate payment amounts
- Include "No hidden fees" or similar trust messaging
- Support both Arabic and English

**Design Requirements:**
- Balance between Tamara branding and your design
- Responsive across devices
- Consistent placement across pages

---

## 4. CHECKOUT FLOW

### 4.1 Create Checkout Session

**When:** Customer selects Tamara at checkout

**API Endpoint:**
```
POST https://api.tamara.co/checkout
```

**Required Parameters:**
```json
{
  "total_amount": {
    "amount": 3500,
    "currency": "SAR"
  },
  "shipping_amount": {
    "amount": 0,
    "currency": "SAR"
  },
  "tax_amount": {
    "amount": 0,
    "currency": "SAR"
  },
  "order_reference_id": "order_12345",
  "order_number": "S12345",
  "items": [{
    "name": "Product Name",
    "type": "Digital",              // or "Physical"
    "reference_id": "prod_123",
    "sku": "SKU-123",
    "quantity": 1,
    "unit_price": {
      "amount": 3500,
      "currency": "SAR"
    },
    "total_amount": {
      "amount": 3500,
      "currency": "SAR"
    }
  }],
  "consumer": {
    "email": "customer@example.com",
    "first_name": "Customer",
    "last_name": "Name",
    "phone_number": "566027755"
  },
  "country_code": "SA",
  "description": "Order description",
  "merchant_url": {
    "success": "https://yoursite.com/payment/success",
    "failure": "https://yoursite.com/payment/failure",
    "cancel": "https://yoursite.com/payment/cancel",
    "notification": "https://yoursite.com/api/webhooks/tamara"
  },
  "payment_type": "PAY_BY_INSTALMENTS",
  "instalments": 3,                 // 3, 4, 6, or 12
  "locale": "ar_SA",                // or "en_US"
  "platform": "Your Platform Name",
  "is_mobile": false
}
```

**Response:**
```json
{
  "order_id": "tamara_order_id",    // SAVE THIS - needed for all operations
  "checkout_id": "checkout_id",
  "status": "new",
  "checkout_url": "https://checkout.tamara.co/..."  // Redirect here
}
```

**CRITICAL:** Save `order_id` in your database!

### 4.2 Installment Options (DYNAMIC - NOT HARDCODED)

**Available Options:**
- **Pay in 3** - For amounts 300+ SAR
- **Pay in 4** - For amounts 1000+ SAR
- **Pay in 6** - For amounts 3000+ SAR
- **Pay in 12** - For amounts 6000+ SAR (extended option)

**IMPORTANT:** These are guidelines. Actual availability depends on:
- Customer eligibility
- Merchant agreement
- Amount
- Location
- Risk assessment

**DO NOT HARDCODE** - Let Tamara determine eligibility

---

## 5. WEBHOOK REGISTRATION & HANDLING (CRITICAL - MISSING)

### 5.1 Register Webhook (One-time)

**Where:** Tamara Partner Portal → Webhooks Section

**Steps:**
1. Login to https://partners.tamara.co
2. Navigate to Webhooks section
3. Click "Add webhooks"
4. Configure:
   - **Type:** Order
   - **Events:** Select "Approved" (minimum required)
   - **URL:** Your webhook endpoint (HTTPS required, max 255 chars)
   - **Headers:** Optional authentication headers

### 5.2 Webhook Security

**Authentication:**
- Tamara sends `tamaraToken` as query parameter
- Also included in Authorization header as `Bearer tamaraToken`
- Token is JWT encoded with HS256 algorithm
- Decode using your Notification Token to verify authenticity

**Example Webhook URL:**
```
https://yoursite.com/api/webhooks/tamara?tamaraToken=eyJhbGc...
```

**Headers:**
```
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

### 5.3 Webhook Events

**Event: Order Approved**
```json
{
  "order_id": "tamara_order_id",
  "order_reference_id": "your_order_12345",
  "order_status": "approved",
  "data": {
    "order_id": "tamara_order_id",
    "status": "approved"
  }
}
```

**Action Required:**
1. Verify `tamaraToken` authenticity
2. Check order exists in your system
3. Call Authorize Order API (see next section)
4. Return HTTP 200 status

**CRITICAL:** Must return 200 status code to acknowledge receipt

---

## 6. ORDER AUTHORIZATION (CRITICAL - MISSING)

### 6.1 Why Authorization is Required

After customer completes payment at Tamara:
1. Order status changes from `new` → `approved`
2. Webhook notification sent to your endpoint
3. **You MUST call Authorize API** to confirm receipt
4. Order status changes to `authorized`
5. Another webhook notification sent

**Without authorization, payment is NOT confirmed!**

### 6.2 Authorize Order API

**API Endpoint:**
```
POST https://api.tamara.co/orders/{order_id}/authorise
```

**Headers:**
```
Authorization: Bearer your_api_token
Content-Type: application/json
```

**Body:**
```json
{
  "order_id": "tamara_order_id"
}
```

**Response:**
```json
{
  "order_id": "tamara_order_id",
  "status": "authorized",
  "order_expiry_time": "2026-01-15T12:00:00Z"
}
```

**When to Call:**
- Immediately after receiving "approved" webhook
- Before fulfilling the order
- Within the expiration time

---

## 7. PAYMENT CAPTURE (CRITICAL)

### 7.1 When to Capture

**IMPORTANT:** Orders NOT captured are NOT settled to your account!

**Capture after:**
- Order is shipped (for physical goods)
- Service is delivered (for digital goods)
- Order is fulfilled

### 7.2 Capture Order API

**API Endpoint:**
```
POST https://api.tamara.co/orders/{order_id}/capture
```

**Headers:**
```
Authorization: Bearer your_api_token
Content-Type: application/json
```

**Body:**
```json
{
  "order_id": "tamara_order_id",
  "total_amount": {
    "amount": 3500,
    "currency": "SAR"
  },
  "shipping_info": {
    "shipped_at": "2026-01-11T10:00:00Z",
    "shipping_company": "Aramex"
  }
}
```

**Response:**
```json
{
  "order_id": "tamara_order_id",
  "status": "captured",
  "capture_id": "capture_id"
}
```

**Capture Rules:**
- Must capture within order expiry time
- Can do partial captures (multiple items)
- Must provide shipping info
- Full amount must be captured eventually

---

## 8. OPTIONAL APIS

### 8.1 Cancel Order

**When:** Customer cancels before shipping

**API Endpoint:**
```
POST https://api.tamara.co/orders/{order_id}/cancel
```

**Requirements:**
- Order must be in `authorized` state
- Cannot cancel after capture

### 8.2 Refund Order

**When:** Customer returns product or requests refund

**API Endpoint:**
```
POST https://api.tamara.co/orders/{order_id}/refunds
```

**Body:**
```json
{
  "order_id": "tamara_order_id",
  "total_amount": {
    "amount": 3500,
    "currency": "SAR"
  },
  "comment": "Customer request"
}
```

**Note:** Refunds processed in real-time at Tamara, but settlement timing varies

### 8.3 Get Order Details

**API Endpoint:**
```
GET https://api.tamara.co/merchants/orders/{order_id}
```

**Use for:**
- Checking order status
- Verifying payment details
- Debugging issues

---

## 9. TESTING REQUIREMENTS

### 9.1 Widget Tests
- [ ] PDP widget shows on all product pages
- [ ] Cart widget updates when cart changes
- [ ] Checkout widget shows correct amount
- [ ] Both Arabic and English work
- [ ] Mobile and desktop responsive
- [ ] Logo displays correctly

### 9.2 Checkout Tests
- [ ] Session creation works
- [ ] All required parameters sent
- [ ] Redirect to Tamara works
- [ ] Language parameter correct
- [ ] Installment options accurate

### 9.3 Webhook Tests
- [ ] Webhook registered correctly
- [ ] Receives "approved" notification
- [ ] Token verification works
- [ ] Returns 200 status
- [ ] Handles duplicate notifications

### 9.4 Authorization Tests
- [ ] Authorize API called after webhook
- [ ] Order status changes to "authorized"
- [ ] Error handling works

### 9.5 Capture Tests
- [ ] Capture API called after shipping
- [ ] Full amount captured
- [ ] Shipping info included
- [ ] Settlement confirmed

---

## 10. CURRENT IMPLEMENTATION GAPS

### ❌ MISSING - Critical:
1. **Widgets** - No PDP/Cart/Checkout widgets
2. **Webhook registration** - Not registered in Partner Portal
3. **Webhook handler** - Not implemented
4. **Order authorization** - Not calling Authorize API
5. **Payment capture** - Not properly implemented
6. **Installment options** - Hardcoded instead of dynamic
7. **Logo** - Using text placeholder instead of official logo
8. **Language support** - Not sending locale parameter

### ⚠️ PARTIAL - Needs Work:
1. **Session creation** - Basic flow works but missing parameters
2. **Redirect handling** - Works but no webhook verification

### ✅ IMPLEMENTED:
1. Basic checkout flow
2. Payment creation API call
3. Redirect handling

---

## 11. IMPLEMENTATION PRIORITY

### Phase 1 - Critical (Must Have):
1. Register webhook in Partner Portal
2. Implement webhook handler with token verification
3. Implement Authorize Order API call
4. Implement proper Capture Order flow
5. Add locale parameter to session creation
6. Fix installment options (remove hardcoding)

### Phase 2 - Important (Should Have):
1. Implement widgets (PDP, Cart, Checkout)
2. Add official Tamara logo
3. Implement Cancel Order API
4. Implement Refund Order API
5. Add Get Order Details for debugging

### Phase 3 - Testing:
1. Test all scenarios with sandbox
2. Verify webhook flow end-to-end
3. Test authorization and capture
4. Test refunds and cancellations
5. Request live credentials

---

## 12. KEY DIFFERENCES FROM TABBY

**Tamara-Specific:**
- Must call Authorize API after webhook (Tabby doesn't require this)
- Supports up to 12 installments (Tabby only 4)
- Requires shipping info for capture
- Different token authentication (JWT with Notification Token)
- Webhook registration via Partner Portal (not API)

**Similar to Tabby:**
- Widgets for on-site messaging
- Checkout session creation
- Webhook notifications
- Payment capture required

---

## 13. CONTACT & SUPPORT

- **Partner Portal:** https://partners.tamara.co
- **Documentation:** https://docs.tamara.co/
- **Support:** Contact via Partner Portal

---

## SUMMARY

**Current Status:** ~15% complete
**Production Ready:** NO
**Estimated Work:** 4-6 days for complete implementation

**Critical Missing Features:**
- Webhooks (payment flow broken without this)
- Order Authorization (required step missing)
- Widgets (conversion optimization)
- Payment Capture (settlements won't happen)
- Proper logo and branding

**Next Steps:**
1. Register webhook in Partner Portal
2. Implement webhook handler
3. Implement Authorize Order API
4. Implement Capture Order API
5. Add widgets
6. Test thoroughly
7. Request live credentials
