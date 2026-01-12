# Payment Integration - Comprehensive Implementation Roadmap

**Created:** January 11, 2026  
**Status:** Planning Phase  
**Total Estimated Time:** 8-13 days

---

## Executive Summary

### Current State:
- **Tabby:** ~20% complete - Basic checkout flow only
- **Tamara:** ~15% complete - Basic checkout flow only
- **Moyasar:** ~60% complete - Form integration working, needs verification

### Critical Issues:
1. **No webhooks implemented** - Payment verification broken
2. **No on-site messaging** - Missing conversion optimization
3. **Hardcoded business rules** - Not scalable
4. **Missing authorization flows** - Tamara payments won't settle
5. **No proper testing** - Unknown production readiness

### Goal:
Production-ready implementation of all three payment providers with complete feature sets, proper error handling, and comprehensive testing.

---

## Implementation Strategy

### Approach:
**Sequential with Parallel Tasks**

1. **Fix Moyasar First** (1-2 days)
   - Already 60% complete
   - Simplest provider
   - Quick win to establish pattern

2. **Implement Tabby** (3-5 days)
   - Most complex (webhooks, pre-scoring, widgets)
   - Highest impact (BNPL conversion)
   - Reference implementation for patterns

3. **Implement Tamara** (4-6 days)
   - Similar to Tabby but with authorization step
   - Can reuse patterns from Tabby
   - Extended payment options (up to 12 installments)

### Parallel Workstreams:
- **Backend:** API integrations, webhooks, payment processing
- **Frontend:** Widgets, forms, UI components
- **Testing:** Test scenarios, validation, QA

---

## Phase 1: Moyasar Completion & Verification (Days 1-2)

### Priority: CRITICAL
### Status: 60% Complete → 100%
### Estimated Time: 1-2 days

### 1.1 Verification Tasks (Day 1 Morning)

**Verify Current Implementation:**
- [ ] Check amount calculation (SAR to Halalas conversion)
- [ ] Verify payment verification logic exists
- [ ] Test callback URL handling
- [ ] Check error handling for failed payments
- [ ] Verify API keys (test vs live)

**Files to Review:**
- `backend/src/modules/payment/moyasar.service.ts`
- `frontend/src/components/payment/MoyasarPaymentForm.tsx`
- Payment callback handlers

**Expected Issues:**
- Amount calculation might be wrong (not multiplying by 100)
- Payment verification might trust redirect alone
- Error handling might be minimal

### 1.2 Fix Issues (Day 1 Afternoon)

**Backend Fixes:**
- [ ] Fix amount calculation if needed
- [ ] Implement proper payment verification
- [ ] Add comprehensive error handling
- [ ] Add payment status tracking

**Code Changes:**
```typescript
// Ensure amount conversion
const amountInHalalas = amountInSAR * 100;

// Verify payment properly
const payment = await moyasarService.fetchPayment(paymentId);
if (payment.status !== 'paid' || payment.amount !== expectedAmount) {
  throw new BadRequestException('Payment verification failed');
}
```

### 1.3 Add Webhooks (Day 2 Morning)

**Register Webhook:**
- [ ] Login to Moyasar Dashboard
- [ ] Navigate to Settings → Webhooks
- [ ] Register webhook URL: `https://yoursite.com/api/webhooks/moyasar`
- [ ] Select events: `payment_paid`, `payment_failed`, `payment_refunded`

**Implement Webhook Handler:**
- [ ] Create webhook endpoint
- [ ] Verify webhook signature (if configured)
- [ ] Handle `payment_paid` event
- [ ] Handle `payment_failed` event
- [ ] Return 200 status immediately
- [ ] Process asynchronously

**Files to Create/Modify:**
- `backend/src/modules/payment/webhooks/moyasar-webhook.controller.ts`
- `backend/src/modules/payment/webhooks/moyasar-webhook.service.ts`

### 1.4 Add Refund Functionality (Day 2 Afternoon)

**Implement Refund API:**
- [ ] Add refund method to Moyasar service
- [ ] Create refund endpoint
- [ ] Add refund validation
- [ ] Test full and partial refunds

**Files to Modify:**
- `backend/src/modules/payment/moyasar.service.ts`
- `backend/src/modules/payment/payment.controller.ts`

### 1.5 Testing (Day 2 End)

**Test Scenarios:**
- [ ] Successful payment with test card
- [ ] Failed payment with test card
- [ ] 3D Secure flow
- [ ] Webhook delivery
- [ ] Payment verification
- [ ] Refund (full and partial)
- [ ] Amount calculation accuracy

**Deliverable:** Moyasar 100% complete and production-ready

---

## Phase 2: Tabby Implementation (Days 3-7)

### Priority: HIGH
### Status: 20% Complete → 100%
### Estimated Time: 3-5 days

### 2.1 Backend Foundation (Day 3)

**Webhook Registration & Handling:**
- [ ] Register webhook via API (one per merchant_code)
- [ ] Create webhook controller and service
- [ ] Implement token verification
- [ ] Handle `authorized` event
- [ ] Whitelist Tabby IPs
- [ ] Implement idempotency handling

**Payment Verification:**
- [ ] Implement proper payment verification via API
- [ ] Never trust redirect URLs alone
- [ ] Verify status, amount, currency

**Payment Capture:**
- [ ] Implement capture API call
- [ ] Trigger capture after authorization
- [ ] Handle capture errors

**Files to Create:**
- `backend/src/modules/payment/webhooks/tabby-webhook.controller.ts`
- `backend/src/modules/payment/webhooks/tabby-webhook.service.ts`

**Files to Modify:**
- `backend/src/modules/payment/providers/tabby/tabby.service.ts`
- `backend/src/modules/payment/bnpl.service.ts`

### 2.2 Background Pre-scoring (Day 4 Morning)

**Implement Eligibility Check:**
- [ ] Call Tabby Checkout API before showing option
- [ ] Handle `status: "created"` → Show Tabby
- [ ] Handle `status: "rejected"` → Hide Tabby
- [ ] Parse rejection reasons
- [ ] Cache eligibility results (short TTL)

**Integration Points:**
- [ ] Check eligibility when loading payment options
- [ ] Show/hide Tabby based on response
- [ ] Display appropriate messages

**Files to Modify:**
- `backend/src/modules/payment/bnpl.service.ts`
- `frontend/src/components/payment/BNPLOptions.tsx`

### 2.3 Language Support (Day 4 Afternoon)

**Add Language Parameter:**
- [ ] Detect user language (Arabic/English)
- [ ] Send `lang: "ar"` or `lang: "en"` in session creation
- [ ] Ensure consistent language across flow

**Files to Modify:**
- `backend/src/modules/payment/providers/tabby/tabby.service.ts`
- Pass language from frontend to backend

### 2.4 On-Site Messaging - Product/Cart Snippets (Day 5)

**Product Details Page Widget:**
- [ ] Add Tabby script to layout
- [ ] Create TabbyPromo component
- [ ] Place near product price
- [ ] Update dynamically with price changes
- [ ] Support both Arabic and English

**Cart Page Widget:**
- [ ] Add TabbyPromo to cart page
- [ ] Place below cart total
- [ ] Update when cart changes
- [ ] Show accurate cart amount

**Files to Create:**
- `frontend/src/components/payment/TabbyPromoWidget.tsx`

**Files to Modify:**
- `frontend/src/app/courses/[id]/page.tsx` (product page)
- `frontend/src/app/cart/page.tsx` (cart page)

**Implementation:**
```typescript
<script src="https://checkout.tabby.ai/tabby-promo.js"></script>
<script>
new TabbyPromo({
  selector: '#TabbyPromo',
  currency: 'SAR',
  price: '3500.00',
  lang: 'ar',
  source: 'product',
  publicKey: process.env.NEXT_PUBLIC_TABBY_PUBLIC_KEY,
  merchantCode: process.env.NEXT_PUBLIC_TABBY_MERCHANT_CODE
});
</script>
```

### 2.5 Checkout Widget (Day 6 Morning)

**Checkout Page Widget:**
- [ ] Add TabbyCard widget to checkout
- [ ] Place near payment method selection
- [ ] Show accurate order total
- [ ] Support both languages

**Files to Modify:**
- `frontend/src/app/checkout/page.tsx`
- `frontend/src/components/payment/PaymentOptions.tsx`

### 2.6 Error Messages & UX (Day 6 Afternoon)

**Implement Proper Error Messages:**
- [ ] Cancellation: "لقد ألغيت الدفعة. فضلاً حاول مجددًا أو اختر طريقة دفع أخرى."
- [ ] Failure: "نأسف، تابي غير قادرة على الموافقة على هذه العملية. الرجاء استخدام طريقة دفع أخرى."
- [ ] Handle all redirect scenarios

**Files to Modify:**
- `frontend/src/app/payment/success/page.tsx`
- `frontend/src/app/payment/failure/page.tsx`
- `frontend/src/app/payment/cancel/page.tsx`

### 2.7 Official Logo (Day 6 End)

**Replace Text with Logo:**
- [ ] Get official Tabby logo SVG
- [ ] Use Next.js Image component
- [ ] Configure `next.config.ts` for logo domain
- [ ] Ensure proper sizing and styling

**Already Done:** Logo implementation exists, verify it's correct

### 2.8 Testing (Day 7)

**Test All Scenarios:**
- [ ] Pre-scoring check (eligible customer)
- [ ] Pre-scoring check (rejected customer)
- [ ] Widgets display correctly (PDP, Cart, Checkout)
- [ ] Language switching works
- [ ] Successful payment flow
- [ ] Cancellation flow
- [ ] Failure flow
- [ ] Webhook delivery
- [ ] Payment verification
- [ ] Capture flow
- [ ] Error messages display correctly

**Share with Tabby:**
- [ ] Share staging site with Tabby Integrations Team
- [ ] Get QA feedback
- [ ] Fix any issues

**Deliverable:** Tabby 100% complete and approved by Tabby team

---

## Phase 3: Tamara Implementation (Days 8-13)

### Priority: HIGH
### Status: 15% Complete → 100%
### Estimated Time: 4-6 days

### 3.1 Webhook Registration (Day 8 Morning)

**Register via Partner Portal:**
- [ ] Login to https://partners.tamara.co
- [ ] Navigate to Webhooks section
- [ ] Click "Add webhooks"
- [ ] Configure:
  - Type: Order
  - Events: Approved (minimum)
  - URL: `https://yoursite.com/api/webhooks/tamara`
  - Headers: Optional auth headers

### 3.2 Webhook Handler & Authorization (Day 8)

**Implement Webhook Handler:**
- [ ] Create webhook endpoint
- [ ] Verify `tamaraToken` JWT
- [ ] Decode using Notification Token
- [ ] Handle `approved` event
- [ ] Return 200 status immediately

**Implement Authorization API:**
- [ ] Call Authorize Order API after webhook
- [ ] Move order from `approved` → `authorized`
- [ ] Handle authorization errors
- [ ] Update order status in database

**CRITICAL:** This is unique to Tamara - must call Authorize API!

**Files to Create:**
- `backend/src/modules/payment/webhooks/tamara-webhook.controller.ts`
- `backend/src/modules/payment/webhooks/tamara-webhook.service.ts`

**Files to Modify:**
- `backend/src/modules/payment/providers/tamara/tamara.service.ts`

### 3.3 Payment Capture (Day 9 Morning)

**Implement Capture Flow:**
- [ ] Call Capture Order API after shipping
- [ ] Include shipping info in request
- [ ] Handle full amount capture
- [ ] Update order status
- [ ] Handle capture errors

**Files to Modify:**
- `backend/src/modules/payment/providers/tamara/tamara.service.ts`
- `backend/src/modules/registration/registration.service.ts` (trigger capture)

### 3.4 Installment Options (Day 9 Afternoon)

**Remove Hardcoding:**
- [ ] Remove hardcoded 3/4 installment logic
- [ ] Implement dynamic installment determination
- [ ] Support 3, 4, 6, 12 installments based on amount
- [ ] Let Tamara API determine eligibility

**Files to Modify:**
- `backend/src/modules/payment/providers/tamara/tamara.service.ts`
- `backend/src/modules/payment/bnpl.service.ts`

**Logic:**
```typescript
// Don't hardcode - let Tamara decide
// Just send the amount and let API return available options
async getInstallmentOptions(amount: number) {
  // Tamara determines eligibility based on:
  // - Amount
  // - Customer
  // - Merchant agreement
  // - Risk assessment
  return await this.tamaraService.getAvailableOptions(amount);
}
```

### 3.5 Language & Locale (Day 10 Morning)

**Add Locale Parameter:**
- [ ] Send `locale: "ar_SA"` or `locale: "en_US"`
- [ ] Ensure consistent language
- [ ] Support both Arabic and English

**Files to Modify:**
- `backend/src/modules/payment/providers/tamara/tamara.service.ts`

### 3.6 Widgets Implementation (Days 10-11)

**Product Details Page Widget:**
- [ ] Load Tamara widget script
- [ ] Create TamaraWidget component
- [ ] Place near product price
- [ ] Update with price changes
- [ ] Support both languages

**Cart Widget:**
- [ ] Add to cart page
- [ ] Place below cart total
- [ ] Update when cart changes

**Checkout Widget:**
- [ ] Add to checkout page
- [ ] Place near payment selection
- [ ] Show accurate order total

**Files to Create:**
- `frontend/src/components/payment/TamaraWidget.tsx`

**Files to Modify:**
- `frontend/src/app/courses/[id]/page.tsx`
- `frontend/src/app/cart/page.tsx`
- `frontend/src/app/checkout/page.tsx`

**Implementation:**
```html
<div id="tamara-product-widget"></div>
<script src="https://cdn.tamara.co/widget-v2/tamara-widget.js"></script>
<script>
window.tamaraWidgetConfig = {
  lang: 'ar',
  country: 'SA',
  publicKey: 'your_public_key',
  amount: 3500.00,
  currency: 'SAR',
  widgetType: 'product-widget'
};
</script>
```

### 3.7 Official Logo (Day 11 Afternoon)

**Get New Refreshed Logo:**
- [ ] Download official Tamara logo (new version)
- [ ] Replace text placeholder
- [ ] Use Next.js Image component
- [ ] Ensure proper branding

**Files to Modify:**
- `frontend/src/components/payment/BNPLOptions.tsx`
- `frontend/next.config.ts`

### 3.8 Cancel & Refund APIs (Day 12 Morning)

**Implement Cancel Order:**
- [ ] Add cancel method to Tamara service
- [ ] Only allow if order is `authorized`
- [ ] Handle cancel errors

**Implement Refund Order:**
- [ ] Add refund method to Tamara service
- [ ] Support full and partial refunds
- [ ] Include refund reason
- [ ] Handle refund errors

**Files to Modify:**
- `backend/src/modules/payment/providers/tamara/tamara.service.ts`
- `backend/src/modules/payment/payment.controller.ts`

### 3.9 Testing (Days 12-13)

**Test All Scenarios:**
- [ ] Checkout session creation
- [ ] Webhook delivery (approved)
- [ ] Authorization API call
- [ ] Order status changes
- [ ] Capture flow with shipping info
- [ ] Widgets display (PDP, Cart, Checkout)
- [ ] Language switching
- [ ] Installment options (3, 4, 6, 12)
- [ ] Cancel flow
- [ ] Refund flow (full and partial)
- [ ] Error handling

**Sandbox Testing:**
- [ ] Use sandbox credentials
- [ ] Test with test cards
- [ ] Verify ID verification flow
- [ ] Complete full payment cycle

**Request Live Credentials:**
- [ ] Contact Tamara team
- [ ] Share staging site
- [ ] Get approval
- [ ] Receive live credentials

**Deliverable:** Tamara 100% complete and approved

---

## Phase 4: Integration & Testing (Day 14)

### 4.1 Unified Payment Options Component

**Ensure Consistency:**
- [ ] All three providers use same UI component
- [ ] Consistent styling and UX
- [ ] Proper error handling for all
- [ ] Loading states for all

**Files to Verify:**
- `frontend/src/components/payment/PaymentOptions.tsx`
- `frontend/src/components/payment/BNPLOptions.tsx`

### 4.2 End-to-End Testing

**Test Complete User Journeys:**
- [ ] Browse product → See Tabby/Tamara widgets → Add to cart
- [ ] Cart page → See widgets → Proceed to checkout
- [ ] Checkout → Select payment method → Complete payment
- [ ] Success/Failure/Cancel scenarios for all providers
- [ ] Webhook delivery for all providers
- [ ] Payment verification for all providers
- [ ] Refund flows for all providers

### 4.3 Error Handling & Edge Cases

**Test Edge Cases:**
- [ ] Network failures during payment
- [ ] Webhook delivery failures
- [ ] Duplicate webhooks
- [ ] Out-of-order webhooks
- [ ] Connection drops during 3D Secure
- [ ] Invalid payment amounts
- [ ] Currency mismatches
- [ ] Expired sessions

### 4.4 Performance Testing

**Verify Performance:**
- [ ] Widget loading times
- [ ] Payment form responsiveness
- [ ] API response times
- [ ] Webhook processing speed
- [ ] Database query optimization

---

## Phase 5: Production Deployment (Day 15)

### 5.1 Environment Configuration

**Update Environment Variables:**
- [ ] Switch to live API keys (all providers)
- [ ] Update webhook URLs to production
- [ ] Verify merchant codes
- [ ] Update callback URLs

**Files to Update:**
- `.env.production`
- `backend/.env.production`

### 5.2 Webhook Registration (Production)

**Re-register Webhooks:**
- [ ] Moyasar: Register production webhook in dashboard
- [ ] Tabby: Register production webhook via API
- [ ] Tamara: Register production webhook in Partner Portal

### 5.3 Final Verification

**Production Smoke Tests:**
- [ ] Verify all API keys work
- [ ] Test one payment with each provider (small amount)
- [ ] Verify webhooks deliver to production
- [ ] Check dashboard for all providers
- [ ] Monitor logs for errors

### 5.4 Monitoring Setup

**Set Up Monitoring:**
- [ ] Payment success/failure rates
- [ ] Webhook delivery rates
- [ ] API error rates
- [ ] Response times
- [ ] Alert on failures

### 5.5 Documentation

**Update Documentation:**
- [ ] API documentation
- [ ] Webhook documentation
- [ ] Testing procedures
- [ ] Troubleshooting guide
- [ ] Runbook for common issues

---

## Risk Management

### High-Risk Items:

**1. Webhook Reliability**
- **Risk:** Webhooks fail, payments not confirmed
- **Mitigation:** 
  - Implement retry logic
  - Add manual reconciliation process
  - Monitor webhook delivery rates
  - Set up alerts

**2. Amount Calculation Errors**
- **Risk:** Wrong amounts charged (Moyasar Halalas)
- **Mitigation:**
  - Comprehensive unit tests
  - Manual verification of calculations
  - Test with various amounts
  - Add validation checks

**3. Tamara Authorization Missing**
- **Risk:** Payments not settled without authorization
- **Mitigation:**
  - Automated authorization after webhook
  - Manual fallback process
  - Monitor unauthorized orders
  - Alert on missing authorizations

**4. Provider API Changes**
- **Risk:** Provider changes API, integration breaks
- **Mitigation:**
  - Subscribe to provider newsletters
  - Monitor provider documentation
  - Version API calls
  - Implement graceful degradation

### Medium-Risk Items:

**1. Widget Loading Failures**
- **Risk:** Widgets don't load, conversion drops
- **Mitigation:**
  - Fallback to text-only display
  - Monitor widget load rates
  - Cache widget scripts

**2. 3D Secure Issues**
- **Risk:** Customers can't complete 3D Secure
- **Mitigation:**
  - Clear instructions
  - Fallback payment methods
  - Support contact info

**3. Language Inconsistencies**
- **Risk:** Mixed Arabic/English in flow
- **Mitigation:**
  - Consistent language detection
  - Test both languages thoroughly
  - Default to user preference

---

## Success Metrics

### Technical Metrics:
- [ ] Payment success rate > 95%
- [ ] Webhook delivery rate > 99%
- [ ] API response time < 2s
- [ ] Zero amount calculation errors
- [ ] Zero missed authorizations (Tamara)

### Business Metrics:
- [ ] Conversion rate increase (BNPL vs card)
- [ ] Average order value increase
- [ ] Cart abandonment rate decrease
- [ ] Customer satisfaction scores

### Compliance Metrics:
- [ ] All Tabby testing checklist items passed
- [ ] All Tamara widget guidelines followed
- [ ] All Moyasar best practices implemented
- [ ] PCI compliance maintained

---

## Dependencies & Blockers

### External Dependencies:
- [ ] Tabby Integrations Team QA approval
- [ ] Tamara live credentials
- [ ] Provider API availability
- [ ] Webhook endpoint accessibility

### Internal Dependencies:
- [ ] Backend deployment pipeline
- [ ] Frontend deployment pipeline
- [ ] Database migrations
- [ ] Environment configuration

### Potential Blockers:
- Provider API downtime
- Webhook delivery issues
- Testing environment access
- Live credential delays

---

## Team Assignments

### Backend Developer:
- Webhook implementations (all providers)
- Payment verification logic
- API integrations
- Capture/Authorization flows
- Refund implementations

### Frontend Developer:
- Widget implementations (Tabby, Tamara)
- Payment form updates
- Error message displays
- Language support
- UI consistency

### QA Engineer:
- Test scenario execution
- Edge case testing
- Performance testing
- Provider-specific testing
- Production smoke tests

### DevOps:
- Environment configuration
- Webhook endpoint setup
- Monitoring setup
- Deployment automation
- Alert configuration

---

## Timeline Summary

| Phase | Days | Status | Deliverable |
|-------|------|--------|-------------|
| Phase 1: Moyasar | 1-2 | Pending | Moyasar 100% complete |
| Phase 2: Tabby | 3-7 | Pending | Tabby 100% complete |
| Phase 3: Tamara | 8-13 | Pending | Tamara 100% complete |
| Phase 4: Integration | 14 | Pending | All providers integrated |
| Phase 5: Production | 15 | Pending | Live deployment |

**Total Duration:** 13-15 days (2-3 weeks)

---

## Next Steps

### Immediate Actions (Today):
1. Review this roadmap with team
2. Assign team members to phases
3. Set up project tracking (Jira/Trello)
4. Schedule daily standups
5. Begin Phase 1 (Moyasar verification)

### Week 1 Goals:
- Complete Moyasar (Phase 1)
- Complete Tabby backend (Phase 2.1-2.3)
- Start Tabby widgets (Phase 2.4)

### Week 2 Goals:
- Complete Tabby (Phase 2)
- Complete Tamara backend (Phase 3.1-3.3)
- Start Tamara widgets (Phase 3.6)

### Week 3 Goals:
- Complete Tamara (Phase 3)
- Integration testing (Phase 4)
- Production deployment (Phase 5)

---

## Lessons Learned (To Apply)

### From Previous Implementation:
1. **Never hardcode third-party business rules** - Always fetch from API
2. **Always implement webhooks** - Don't rely on redirects alone
3. **Read complete documentation first** - Don't implement blindly
4. **Test thoroughly before claiming complete** - Use official testing checklists
5. **Follow provider guidelines exactly** - Don't improvise

### Best Practices to Follow:
1. **Dynamic configuration over static hardcoding**
2. **Verify payments on backend, never trust frontend**
3. **Implement proper error handling and user messages**
4. **Use official logos and branding**
5. **Support both Arabic and English**
6. **Test with real-world scenarios**
7. **Monitor and alert on failures**
8. **Document everything**

---

## Conclusion

This roadmap provides a comprehensive, prioritized plan to complete all three payment provider integrations. By following this plan systematically, we will achieve:

✅ Production-ready implementations  
✅ Complete feature sets  
✅ Proper error handling  
✅ Comprehensive testing  
✅ Provider approval  
✅ Scalable architecture  

**Estimated completion:** 2-3 weeks with dedicated team

**Ready to begin Phase 1: Moyasar Completion & Verification**
