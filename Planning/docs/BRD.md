# Short Courses Registration & Management Platform

**Business Requirements Document (BRD v2)**  
**Client:** Saudi Electronic University (SEU)  
**Last Updated:** 2026-01-23  
**Status:** Approved

---

## 1. Executive Summary

Saudi Electronic University (SEU) intends to establish a **centralized digital platform** to manage the **full lifecycle of short courses and training programs**, from discovery and registration through live training delivery, completion tracking, and certification.

> [!IMPORTANT]
> **Core Principle:** This platform manages **the full learning experience** — including live training delivery via Zoom integration.

---

## 2. Strategic Objectives

### 2.1 Business Objectives

* Create a **single official storefront** for SEU short programs
* Enable **revenue growth** through modern digital payments (HyperPay + BNPL)
* Support **individual and corporate clients** at scale
* Deliver **live virtual training** with full attendance tracking
* Reduce operational overhead through automation and approval workflows
* Enable data-driven decisions (demand, pricing, capacity, completion rates)

### 2.2 What Success Looks Like

* Learners can discover, register, pay, and attend training in one platform
* Instructors can independently deliver sessions and track attendance
* Corporate clients can purchase, assign, and track seats easily
* Finance teams get clean reconciliation and reporting
* Program teams launch new offerings without IT dependency
* Certificates issued automatically upon completion criteria met

---

## 3. In-Scope vs Out-of-Scope

### 3.1 In Scope

| Capability | Description |
|------------|-------------|
| Course catalog & marketing pages | SEO-friendly, multilingual (AR/EN) |
| Registration (B2C + B2B) | Individual and corporate enrollment |
| Payments | HyperPay (cards), Tabby, Tamara (BNPL), Invoices (B2B) |
| **Live Training Delivery** | Zoom integration for virtual sessions |
| **Instructor Portal** | Materials upload, attendance, messaging |
| Attendance Tracking | Automatic (Zoom) + manual override |
| Certificates & credentials | Digital issuance with verification |
| Operations (cohorts, capacity) | Scheduling, waitlists, seat management |
| B2B Coordinator Portal | Corporate client onboarding and management |
| Communications | Email + in-platform messaging |
| Approval Workflows | Refunds, cancellations, certificate overrides |
| Reporting & analytics | Operational, financial, strategic |
| Admin & governance | RBAC, audit logs, configuration |

### 3.2 Explicitly Out of Scope

| Item | Reason |
|------|--------|
| Learning content authoring (video production) | External tools |
| Complex assessments/quizzes | May be Phase 2+ |
| Proctoring | Not required for short courses |
| Mobile native app | Phase 3 |
| External LMS integration (Blackboard) | **Removed from scope** |

---

## 4. Target Users & Personas

### 4.1 Persona Summary

| Persona | Primary Responsibility |
|---------|----------------------|
| **Program Manager** | Creates programs, defines curriculum, sets pricing, assigns instructors |
| **Operations Coordinator** | Manages cohorts, schedules, B2B onboarding, exception handling |
| **Instructor** | Delivers training via Zoom, uploads materials, tracks attendance, messages learners |
| **Learner (B2C)** | Discovers courses, registers, pays, attends sessions, receives certificate |
| **Corporate Coordinator (B2B)** | Purchases seats for organization, assigns nominees, tracks utilization |
| **Finance** | Revenue tracking, refund processing, reconciliation |
| **Platform Admin** | System configuration, user management, RBAC, audit |

### 4.2 Persona-Lifecycle Matrix

| Persona | Design & Setup | Marketing | Registration | Training | Post-Training |
|---------|---------------|-----------|--------------|----------|---------------|
| Program Manager | ●●●●● | ●●●○○ | ○○○○○ | ○○○○○ | ●●○○○ |
| Ops Coordinator | ●●●○○ | ○○○○○ | ●●●●● | ●●●○○ | ●●●○○ |
| Instructor | ●●○○○ | ○○○○○ | ○○○○○ | ●●●●● | ●●○○○ |
| Learner (B2C) | ○○○○○ | ●●●●● | ●●●●● | ●●●●● | ●●●○○ |
| Corporate Coord | ○○○○○ | ●●●○○ | ●●●●● | ●●○○○ | ●●●●○ |
| Finance | ○○○○○ | ○○○○○ | ●●●○○ | ○○○○○ | ●●●●● |
| Platform Admin | ●●●○○ | ○○○○○ | ○○○○○ | ○○○○○ | ●●○○○ |

*Legend: ●●●●● Primary | ●●●○○ Secondary | ●●○○○ Occasional | ○○○○○ N/A*

---

## 5. Functional Requirements

### 5.1 Catalog & Program Management

| ID | Requirement | Priority |
|----|-------------|----------|
| CAT-01 | Create programs with title, description (AR/EN), outcomes | P0 |
| CAT-02 | Define curriculum structure (modules, sessions) | P0 |
| CAT-03 | Set pricing (regular, early-bird, corporate) | P0 |
| CAT-04 | Assign instructor(s) to program | P0 |
| CAT-05 | Set program prerequisites | P1 |
| CAT-06 | Define certificate eligibility criteria | P0 |
| CAT-07 | Publish/unpublish program to catalog | P0 |
| CAT-08 | Clone existing program | P1 |
| CAT-09 | SEO-friendly public pages with UTM tracking | P0 |

---

### 5.2 Registration & Enrollment (B2C)

| ID | Requirement | Priority |
|----|-------------|----------|
| REG-01 | Browse catalog with search/filter | P0 |
| REG-02 | View program details (description, outcomes, schedule, price) | P0 |
| REG-03 | Create account and authenticate | P0 |
| REG-04 | Select cohort and reserve seat (time-bound) | P0 |
| REG-05 | Join waitlist if cohort full | P0 |
| REG-06 | Apply promo codes | P1 |
| REG-07 | Receive confirmation email with instructions | P0 |
| REG-08 | View "My Courses" dashboard | P0 |
| REG-09 | Request refund (per policy) | P1 |

---

### 5.3 Corporate Registration (B2B)

| ID | Requirement | Priority |
|----|-------------|----------|
| B2B-01 | View available programs for corporate purchase | P0 |
| B2B-02 | Request bulk seat purchase (invoice-based) | P0 |
| B2B-03 | View assigned seat quota | P0 |
| B2B-04 | Assign employees to seats (nominees) | P0 |
| B2B-05 | Replace nominees (before cutoff) | P0 |
| B2B-06 | Track nominee enrollment and completion status | P0 |
| B2B-07 | Download organization utilization report | P1 |

**Operations Coordinator B2B Portal:**

| ID | Requirement | Priority |
|----|-------------|----------|
| B2B-10 | Register corporate clients | P0 |
| B2B-11 | Manually enroll B2B nominees | P0 |
| B2B-12 | Send enrollment confirmation emails to nominees | P0 |
| B2B-13 | Track seat utilization per organization | P0 |

---

### 5.4 Payments & Financial Flows

| ID | Requirement | Priority |
|----|-------------|----------|
| PAY-01 | Process card payments via **HyperPay** | P0 |
| PAY-02 | Offer BNPL via **Tabby** | P0 |
| PAY-03 | Offer BNPL via **Tamara** | P0 |
| PAY-04 | Generate invoices for B2B clients | P0 |
| PAY-05 | Issue payment receipts | P0 |
| PAY-06 | Process refunds (with approval workflow) | P0 |
| PAY-07 | Failed payment recovery notifications | P1 |

---

### 5.5 Live Training Delivery (Zoom Integration)

| ID | Requirement | Priority |
|----|-------------|----------|
| ZOM-01 | Auto-create Zoom meetings when cohort scheduled | P0 |
| ZOM-02 | Instructor starts session independently from platform | P0 |
| ZOM-03 | Learners join session directly from platform | P0 |
| ZOM-04 | Embed Zoom meeting within platform (SDK) | P0 |
| ZOM-05 | Track attendance automatically via Zoom webhooks | P0 |
| ZOM-06 | Store session recordings (optional) | P2 |
| ZOM-07 | Manage Zoom licenses programmatically | P1 |

---

### 5.6 Instructor Portal

| ID | Requirement | Priority |
|----|-------------|----------|
| INS-01 | View assigned courses and upcoming sessions | P0 |
| INS-02 | Start Zoom session from platform | P0 |
| INS-03 | Upload course materials (PDFs, slides, links) | P0 |
| INS-04 | View enrolled learner list | P0 |
| INS-05 | Track/mark attendance (auto + manual override) | P0 |
| INS-06 | Send messages to enrolled learners | P0 |
| INS-07 | View attendance reports per session | P1 |
| INS-08 | Request certificate eligibility override | P0 |

---

### 5.7 Learner Experience

| ID | Requirement | Priority |
|----|-------------|----------|
| LRN-01 | View "My Courses" dashboard with enrolled programs | P0 |
| LRN-02 | Join Zoom session from platform | P0 |
| LRN-03 | Download course materials | P0 |
| LRN-04 | View attendance history | P1 |
| LRN-05 | Receive and download certificate | P0 |
| LRN-06 | View program completion status | P0 |

---

### 5.8 Certificates & Credentials

| ID | Requirement | Priority |
|----|-------------|----------|
| CRT-01 | Define eligibility rules (attendance threshold) | P0 |
| CRT-02 | Auto-issue certificates upon completion | P0 |
| CRT-03 | Generate digital certificates (PDF + verification link) | P0 |
| CRT-04 | Certificate branding per program | P1 |
| CRT-05 | Re-issue and revocation controls | P1 |
| CRT-06 | Public verification page | P0 |
| CRT-07 | Certificate eligibility override (with approval) | P0 |

---

### 5.9 Operations & Cohort Management

| ID | Requirement | Priority |
|----|-------------|----------|
| OPS-01 | Create cohort with start date, capacity, schedule | P0 |
| OPS-02 | Schedule individual sessions within cohort | P0 |
| OPS-03 | Manage waitlist and auto-promote learners | P0 |
| OPS-04 | Force-enroll learners (comp seats) with approval | P1 |
| OPS-05 | View real-time capacity dashboards | P0 |
| OPS-06 | Process postponement (date changes) with approval | P0 |
| OPS-07 | Cancel program (with approval and refund processing) | P0 |
| OPS-08 | Send bulk communications to cohort | P1 |

---

### 5.10 Communications

| ID | Requirement | Priority |
|----|-------------|----------|
| COM-01 | Registration confirmation emails | P0 |
| COM-02 | Payment receipts | P0 |
| COM-03 | Pre-course reminders | P0 |
| COM-04 | Session join instructions | P0 |
| COM-05 | Completion and certificate notifications | P0 |
| COM-06 | Instructor-to-learner messaging | P0 |
| COM-07 | Bulk notifications for cohort | P1 |

---

### 5.11 Approval Workflows

| Action | Initiator | Approver(s) | Priority |
|--------|-----------|-------------|----------|
| Refund Processing | Coordinator / Learner | Finance Manager | P0 |
| Bulk B2B Enrollment | Ops Coordinator | Operations Manager | P0 |
| Program Cancellation | Ops Coordinator | Operations Manager + Finance | P0 |
| Program Postponement | Ops Coordinator | Operations Manager | P0 |
| Certificate Eligibility Override | Instructor | Program Manager | P0 |
| Force Enrollment (Comp Seats) | Ops Coordinator | Operations Manager | P1 |

**Approval System Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| APR-01 | Pending approvals dashboard | P0 |
| APR-02 | Email notification on approval request | P0 |
| APR-03 | Approve/Reject with comments | P0 |
| APR-04 | Audit trail for all approval decisions | P0 |
| APR-05 | Escalation rules (auto-escalate after X hours) | P1 |

---

### 5.12 Reporting & Analytics

**Operational Reports:**
* Enrollments by program/cohort
* Attendance rates per session
* Capacity utilization
* Completion rates

**Financial Reports:**
* Revenue by program, cohort, date range
* Payment method breakdown (HyperPay, Tabby, Tamara)
* Refund tracking
* B2B invoice aging

**Strategic Insights:**
* Demand trends
* Conversion funnel analysis
* Corporate client behavior

---

### 5.13 Admin, Governance & Security

| ID | Requirement | Priority |
|----|-------------|----------|
| ADM-01 | User management (create, disable, roles) | P0 |
| ADM-02 | Role-based access control (RBAC) | P0 |
| ADM-03 | Audit logs for all sensitive actions | P0 |
| ADM-04 | System configuration (payment, email templates) | P1 |
| ADM-05 | Zoom license management | P1 |
| ADM-06 | Contact inquiry management (view, assign, respond, resolve) | P1 |

#### ADM-06: Contact Inquiry Management

**Description:** Admin interface to manage contact form submissions from the public website.

**Lifecycle:**
```
NEW → IN_PROGRESS → RESOLVED → CLOSED
         ↓
      (reassign)
```

**Features:**
- List all inquiries with filters (status, subject, date range)
- View inquiry details (name, email, phone, message, metadata)
- Assign to staff member
- Add internal notes (not visible to sender)
- Mark as resolved with resolution notes
- Close without action (spam, duplicate, etc.)
- Reply via email (opens email client or sends via platform)

**Bot Protection (TODO):**
- [ ] Add honeypot field (simple anti-bot)
- [ ] Integrate Cloudflare Turnstile for production

---

## 6. Edge Cases & Exception Flows

### 6.1 Program Cancellation

**Trigger:** Program cancelled after learners registered

**Consequences:**
* All active registrations cancelled
* Full refunds processed (with approval)
* Waitlist cleared
* Notification sent to all affected learners
* B2B seats returned to organization quota
* Zoom meetings deleted

---

### 6.2 Program Postponement

**Trigger:** Cohort dates changed after registrations

**Consequences:**
* All registered learners notified of new dates
* Zoom meetings rescheduled
* Learners given option to: confirm or request refund
* Calendar invites updated

---

### 6.3 Refund Policy

| Stage | Eligibility | Approval |
|-------|-------------|----------|
| Before start (> N days) | 100% refund | Auto-approved |
| Before start (≤ N days) | 100% refund | Finance approval |
| After course start | No refund | N/A |
| Special circumstances | Case-by-case | Finance + Ops Manager |

---

## 7. Non-Functional Requirements

* High availability during enrollment peaks
* Scalable architecture
* API-first design
* Mobile-responsive UX
* Arabic RTL first-class support
* Observability (logs, metrics)
* Secure payment handling (PCI via gateway)

---

## 8. External Integrations

| System | Purpose |
|--------|---------|
| **Zoom (Meeting SDK + API)** | Live training sessions, attendance |
| **HyperPay** | Card payment processing |
| **Tabby** | BNPL payment option |
| **Tamara** | BNPL payment option |
| Email Provider (TBD) | Email delivery |
| SMS Provider (TBD) | SMS delivery (optional) |

---

## 9. Phased Delivery

### Phase 1 (MVP)

* Catalog
* B2C + B2B Registration
* Payments (HyperPay + BNPL)
* Zoom Integration
* Instructor Portal
* B2B Coordinator Portal
* Certificates
* Approval Workflows
* Core Reporting

### Phase 2 (Scale)

* Advanced analytics
* Bundles & learning paths
* Enhanced B2B features

### Phase 3 (Ecosystem)

* External partners
* White-label offerings
* Mobile app

---

## 10. Key Design Principle

> **"This platform manages the full learning experience."**

This principle guides **every architectural and product decision**.

---

*Document Version: 2.0 | Approved: 2026-01-23*
