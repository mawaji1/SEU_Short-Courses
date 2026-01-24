# PRD: B2C Registration

## Introduction

Enable individual learners to discover programs, select cohorts, reserve seats, and proceed to payment. This is the primary revenue-generating flow for individual learners.

**Depends on:** `user-auth`, `catalog-management`

## Goals

- Primary: Frictionless registration from discovery to payment
- Secondary: Waitlist management when cohorts are full
- Secondary: Promo code support

## User Stories

### US-001: Registration Schema
**Description:** As a developer, I want registration schema so that enrollments are stored.

**Acceptance Criteria:**
- [ ] Registration table: id, user_id, cohort_id, status, payment_status, promo_code_id, created_at
- [ ] RegistrationStatus enum: PENDING, CONFIRMED, CANCELLED, WAITLISTED
- [ ] PaymentStatus enum: PENDING, PAID, REFUNDED, FAILED
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-002: Select Cohort Flow
**Description:** As a learner, I want to select a cohort so that I can enroll in a specific session.

**Acceptance Criteria:**
- [ ] Cohort selector on program page
- [ ] Shows start date, available seats, schedule
- [ ] Disabled if no seats available
- [ ] "Join Waitlist" shown when full
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/programs/[slug]

---

### US-003: Seat Reservation
**Description:** As a system, I want to reserve seats so that capacity isn't exceeded.

**Acceptance Criteria:**
- [ ] Create pending registration on cohort selection
- [ ] Seat hold expires after 15 minutes if unpaid
- [ ] Decrement available seats count
- [ ] Atomic transaction to prevent overselling
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-004: Registration Summary Page
**Description:** As a learner, I want to see a summary before paying so that I can confirm my choice.

**Acceptance Criteria:**
- [ ] Display program name, cohort dates, price
- [ ] Show time remaining on seat hold
- [ ] Promo code input field
- [ ] "Proceed to Payment" button
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/checkout

---

### US-005: Apply Promo Code
**Description:** As a learner, I want to apply a promo code so that I get a discount.

**Acceptance Criteria:**
- [ ] Promo code input field
- [ ] Validate code on apply
- [ ] Show discounted price
- [ ] Error message for invalid/expired codes
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/checkout

---

### US-006: Promo Code Schema
**Description:** As a developer, I want promo code schema so that discounts are configured.

**Acceptance Criteria:**
- [ ] PromoCode table: id, code, discount_type, discount_value, valid_from, valid_to, max_uses, current_uses
- [ ] DiscountType enum: PERCENTAGE, FIXED
- [ ] Unique constraint on code
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-007: Join Waitlist
**Description:** As a learner, I want to join a waitlist so that I'm notified when seats open.

**Acceptance Criteria:**
- [ ] "Join Waitlist" button when cohort full
- [ ] Creates waitlist entry with position
- [ ] Confirmation message shown
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/programs/[slug]

---

### US-008: Waitlist Schema
**Description:** As a developer, I want waitlist schema so that queue position is tracked.

**Acceptance Criteria:**
- [ ] Waitlist table: id, user_id, cohort_id, position, status, created_at
- [ ] WaitlistStatus enum: WAITING, PROMOTED, EXPIRED
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-009: Auto-Promote from Waitlist
**Description:** As a system, I want to promote waitlisted learners so that cancelled seats are filled.

**Acceptance Criteria:**
- [ ] When registration cancelled, check waitlist
- [ ] Promote first in queue
- [ ] Send notification email
- [ ] Set 24-hour expiry on offer
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-010: My Courses Dashboard
**Description:** As a learner, I want to see my enrolled courses so that I can track my learning.

**Acceptance Criteria:**
- [ ] List of confirmed registrations
- [ ] Show program name, cohort dates, status
- [ ] Link to course detail page
- [ ] Upcoming sessions highlighted
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/my-courses

---

### US-011: Registration Confirmation Email
**Description:** As a system, I want to send confirmation emails so that learners have proof.

**Acceptance Criteria:**
- [ ] Email sent after payment confirmed
- [ ] Contains program name, dates, receipt number
- [ ] Includes calendar invite attachment
- [ ] Arabic content with English fallback
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-012: Cancel Registration
**Description:** As a learner, I want to cancel my registration so that I can request a refund.

**Acceptance Criteria:**
- [ ] "Cancel" button on My Courses (before start only)
- [ ] Confirmation modal with refund policy
- [ ] Creates refund request (pending approval)
- [ ] Updates registration status
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/my-courses

---

## Functional Requirements

1. Time-bound seat reservation (15 min)
2. Atomic seat decrement to prevent overselling
3. Waitlist with FIFO promotion
4. Promo code validation and application
5. Registration confirmation emails

## Non-Goals

- Multiple cohort booking in one transaction
- Group registrations (use B2B for that)

## Design Considerations

- Clear countdown timer on seat hold
- Mobile-optimized checkout
- Arabic-first content

## Technical Considerations

- Database transactions for seat management
- Cron job for expired holds cleanup
- Email queue for notifications

## Success Metrics

- Registration completion rate > 70%
- Seat hold expiry rate < 10%
- Waitlist conversion rate > 50%

## Open Questions

- Maximum waitlist size per cohort?
- Promo code usage limits per user?
