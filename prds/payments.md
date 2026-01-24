# PRD: Payments

## Introduction

Process payments securely using HyperPay for cards and Tabby/Tamara for BNPL. Handle invoicing for B2B clients and refund processing.

**Depends on:** `registration-b2c`, `registration-b2b`

## Goals

- Primary: Secure card payment processing via HyperPay
- Primary: BNPL options via Tabby and Tamara
- Secondary: Invoice generation for B2B
- Secondary: Refund processing with approval

## User Stories

### US-001: Payment Schema
**Description:** As a developer, I want payment schema so that transactions are tracked.

**Acceptance Criteria:**
- [ ] Payment table: id, registration_id, amount, currency, method, provider, provider_ref, status, created_at
- [ ] PaymentMethod enum: CARD, TABBY, TAMARA, INVOICE
- [ ] PaymentStatus enum: PENDING, SUCCESS, FAILED, REFUNDED
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-002: HyperPay Configuration
**Description:** As a developer, I want HyperPay config so that card payments work.

**Acceptance Criteria:**
- [ ] Environment variables for HYPERPAY_ENTITY_ID, ACCESS_TOKEN
- [ ] Sandbox/production mode toggle
- [ ] Validation on startup
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-003: Create Checkout Session (HyperPay)
**Description:** As a system, I want to create checkout sessions so that learners can pay.

**Acceptance Criteria:**
- [ ] API call to HyperPay to create checkout
- [ ] Returns checkout ID
- [ ] Stores pending payment record
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-004: Payment Page (HyperPay)
**Description:** As a learner, I want a payment page so that I can enter card details.

**Acceptance Criteria:**
- [ ] Embedded HyperPay form
- [ ] Amount displayed clearly
- [ ] Loading state during processing
- [ ] Error handling for failures
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/payment/[id]

---

### US-005: Payment Callback Handler
**Description:** As a system, I want to handle callbacks so that payment status updates.

**Acceptance Criteria:**
- [ ] Webhook endpoint for HyperPay
- [ ] Verify signature
- [ ] Update payment status
- [ ] Update registration status on success
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-006: Tabby Configuration
**Description:** As a developer, I want Tabby config so that BNPL works.

**Acceptance Criteria:**
- [ ] Environment variables for TABBY_PUBLIC_KEY, SECRET_KEY
- [ ] Sandbox/production mode
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-007: Create Tabby Session
**Description:** As a system, I want to create Tabby sessions so that learners can use BNPL.

**Acceptance Criteria:**
- [ ] API call to create Tabby checkout
- [ ] Include buyer info, amount, items
- [ ] Returns redirect URL
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-008: Tabby Payment Option
**Description:** As a learner, I want to see Tabby option so that I can pay later.

**Acceptance Criteria:**
- [ ] Tabby logo and "Pay in 4" messaging
- [ ] Eligibility check (minimum amount)
- [ ] Redirect to Tabby on selection
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/checkout

---

### US-009: Tabby Webhook Handler
**Description:** As a system, I want to handle Tabby webhooks so that status updates.

**Acceptance Criteria:**
- [ ] Webhook endpoint
- [ ] Verify authenticity
- [ ] Update payment and registration status
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-010: Tamara Configuration
**Description:** As a developer, I want Tamara config so that second BNPL works.

**Acceptance Criteria:**
- [ ] Environment variables for TAMARA_API_URL, TOKEN
- [ ] Sandbox/production mode
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-011: Create Tamara Session
**Description:** As a system, I want to create Tamara sessions for BNPL.

**Acceptance Criteria:**
- [ ] API call to create Tamara order
- [ ] Include buyer info, amount
- [ ] Returns redirect URL
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-012: Tamara Payment Option
**Description:** As a learner, I want to see Tamara option for BNPL.

**Acceptance Criteria:**
- [ ] Tamara logo and installment messaging
- [ ] Eligibility check
- [ ] Redirect to Tamara on selection
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/checkout

---

### US-013: Payment Receipt Generation
**Description:** As a system, I want to generate receipts so that learners have proof.

**Acceptance Criteria:**
- [ ] PDF receipt with: receipt #, date, payer, amount, program
- [ ] SEU branding
- [ ] Downloadable from dashboard
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-014: Invoice Schema
**Description:** As a developer, I want invoice schema for B2B billing.

**Acceptance Criteria:**
- [ ] Invoice table: id, organization_id, seat_purchase_id, amount, due_date, status, paid_at
- [ ] InvoiceStatus enum: DRAFT, SENT, PAID, OVERDUE
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-015: Generate B2B Invoice
**Description:** As a system, I want to generate invoices for corporate purchases.

**Acceptance Criteria:**
- [ ] PDF invoice with: invoice #, org details, line items, total
- [ ] SEU branding and VAT info
- [ ] Bank transfer details
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-016: Mark Invoice Paid
**Description:** As a finance user, I want to mark invoices paid so that seats activate.

**Acceptance Criteria:**
- [ ] "Mark Paid" button on invoice
- [ ] Records paid_at timestamp
- [ ] Activates seat purchase
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/invoices

---

### US-017: Refund Request
**Description:** As a learner, I want to request a refund so that I get my money back.

**Acceptance Criteria:**
- [ ] Creates refund request record
- [ ] Captures reason
- [ ] Triggers approval workflow
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-018: Process Refund
**Description:** As a finance user, I want to process approved refunds so that money is returned.

**Acceptance Criteria:**
- [ ] Call provider refund API
- [ ] Update payment status to REFUNDED
- [ ] Update registration status
- [ ] Typecheck passes
- [ ] Lint passes

---

## Functional Requirements

1. HyperPay card payment integration
2. Tabby BNPL integration
3. Tamara BNPL integration
4. Invoice generation for B2B
5. Refund processing with approval

## Non-Goals

- Subscription billing
- Apple Pay/Google Pay (future)
- Multi-currency

## Design Considerations

- Clear payment option selector
- Trust badges for security
- Arabic payment forms

## Technical Considerations

- PCI compliance via hosted forms
- Webhook verification
- Idempotency keys for payments

## Success Metrics

- Payment success rate > 95%
- Refund processing time < 3 days
- BNPL adoption rate > 20%

## Open Questions

- BNPL minimum purchase amount?
- Refund timeframe policy?
