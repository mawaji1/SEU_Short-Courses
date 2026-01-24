# PRD: B2B Registration & Coordinator Portal

## Introduction

Enable corporate clients to purchase seats in bulk, assign nominees, and track completion. Includes the Operations Coordinator portal for B2B client onboarding and management.

**Depends on:** `user-auth`, `catalog-management`, `registration-b2c`

## Goals

- Primary: Corporate bulk seat purchasing
- Primary: Nominee assignment and tracking
- Secondary: Coordinator portal for B2B management

## User Stories

### US-001: Organization Schema
**Description:** As a developer, I want organization schema so that corporate clients are stored.

**Acceptance Criteria:**
- [ ] Organization table: id, name_ar, name_en, contact_email, contact_phone, address, created_at
- [ ] OrganizationUser junction for coordinators
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-002: Seat Purchase Schema
**Description:** As a developer, I want seat purchase schema so that bulk orders are tracked.

**Acceptance Criteria:**
- [ ] SeatPurchase table: id, organization_id, cohort_id, quantity, assigned_count, invoice_id, status
- [ ] PurchaseStatus enum: PENDING_PAYMENT, ACTIVE, EXPIRED
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-003: Corporate Catalog View
**Description:** As a corporate coordinator, I want to browse programs so that I can select training for employees.

**Acceptance Criteria:**
- [ ] Programs filtered to show corporate pricing
- [ ] Bulk purchase CTA button
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/corporate/programs

---

### US-004: Request Bulk Purchase
**Description:** As a corporate coordinator, I want to request seats so that I can train employees.

**Acceptance Criteria:**
- [ ] Form with: program, cohort, quantity
- [ ] Shows corporate pricing × quantity
- [ ] Creates pending purchase
- [ ] Generates invoice
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/corporate/purchase

---

### US-005: View Seat Quota
**Description:** As a corporate coordinator, I want to see my seat quota so that I know availability.

**Acceptance Criteria:**
- [ ] Dashboard showing total seats, assigned, remaining
- [ ] Per-cohort breakdown
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/corporate/dashboard

---

### US-006: Assign Nominee
**Description:** As a corporate coordinator, I want to assign employees so that they can attend.

**Acceptance Criteria:**
- [ ] Form with nominee name, email, phone
- [ ] Validates available seats
- [ ] Creates user if not exists
- [ ] Creates registration for nominee
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/corporate/seats/[id]/assign

---

### US-007: Replace Nominee
**Description:** As a corporate coordinator, I want to replace nominees so that seats aren't wasted.

**Acceptance Criteria:**
- [ ] Replace button on assigned nominee
- [ ] Only before cutoff date
- [ ] Cancels old registration
- [ ] Creates new registration
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/corporate/seats/[id]

---

### US-008: Track Nominee Status
**Description:** As a corporate coordinator, I want to track nominee status so that I monitor utilization.

**Acceptance Criteria:**
- [ ] Status column: Pending, Enrolled, Completed, Withdrawn
- [ ] Attendance percentage shown
- [ ] Certificate status indicator
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/corporate/dashboard

---

### US-009: Corporate Utilization Report
**Description:** As a corporate coordinator, I want to download reports so that I can report internally.

**Acceptance Criteria:**
- [ ] Export to CSV/Excel
- [ ] Includes: nominee, program, status, completion, certificate
- [ ] Date range filter
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/corporate/reports

---

### US-010: Coordinator Portal - Organization List
**Description:** As an operations coordinator, I want to see all organizations so that I can manage B2B clients.

**Acceptance Criteria:**
- [ ] List of all organizations
- [ ] Search by name
- [ ] Shows seat purchases count
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/organizations

---

### US-011: Coordinator Portal - Register Organization
**Description:** As an operations coordinator, I want to register new organizations so that they can purchase.

**Acceptance Criteria:**
- [ ] Form with org details
- [ ] Create primary coordinator user
- [ ] Send welcome email with login instructions
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/organizations/new

---

### US-012: Coordinator Portal - Manual Enrollment
**Description:** As an operations coordinator, I want to manually enroll nominees so that I can assist clients.

**Acceptance Criteria:**
- [ ] Select organization, cohort, enter nominees
- [ ] Bulk upload via CSV
- [ ] Requires approval (per APR workflow)
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/enrollments/new

---

### US-013: Coordinator Enrollment Email
**Description:** As a system, I want to email nominees so that they know how to access.

**Acceptance Criteria:**
- [ ] Email contains: program name, dates, login instructions
- [ ] Link to create password if new user
- [ ] Arabic content
- [ ] Typecheck passes
- [ ] Lint passes

---

## Functional Requirements

1. Organization and seat purchase management
2. Nominee assignment with replacement before cutoff
3. Utilization tracking and reporting
4. Coordinator portal for admin tasks
5. Invoice-based payment for B2B

## Non-Goals

- Self-service invoice payment online
- Multi-cost-center billing
- SSO integration

## Design Considerations

- Dashboard-focused for coordinators
- Clear seat availability indicators
- Mobile-friendly nominee management

## Technical Considerations

- Bulk CSV upload parsing
- Invoice PDF generation
- Email templates for nominees

## Success Metrics

- Seat utilization rate > 85%
- Nominee assignment time < 2 minutes per seat
- Report generation < 5 seconds

## Open Questions

- Maximum seats per purchase?
- Cutoff period for nominee replacement?
