# Short Courses Registration & Management Platform

**Business Requirements & Functional Specification (BRD + FRD v1)**
**Client:** Saudi Electronic University (SEU)

---

## 1. Executive Summary

Saudi Electronic University (SEU) intends to establish a **centralized digital platform** to manage the **full lifecycle of short courses and training programs**, covering discovery, registration, payments, client management, operations, reporting, and post-learning services.

The platform will **not replace the learning management system**. Learning delivery, content consumption, and assessments will continue to be hosted on **Blackboard**.

Instead, this platform acts as the **experience, commerce, and operations layer**, inspired by best-in-class international platforms (e.g., Coursera-grade UX, Arlo-style operations, Udemy Business-like B2B management), while fully aligned with SEU’s governance and business model.

---

## 2. Strategic Objectives

### 2.1 Business Objectives

* Create a **single official storefront** for SEU short programs
* Enable **revenue growth** through modern digital payments and installment options
* Support **individual and corporate clients** at scale
* Reduce operational overhead through automation
* Enable data-driven decisions (demand, pricing, capacity)
* Prepare for future expansion (bundles, partnerships, scale)

### 2.2 What Success Looks Like

* Learners can discover, register, pay, and access learning in minutes
* Corporate clients can purchase, assign, and track seats easily
* Finance teams get clean reconciliation and reporting
* Program teams launch new offerings without IT dependency
* Blackboard remains focused on **learning**, not operations

---

## 3. In-Scope vs Out-of-Scope

### 3.1 In Scope

* Course catalog & marketing pages
* Registration (individual & corporate)
* Payments & installments
* Client & organization management
* Enrollment orchestration with Blackboard
* Certificates & post-course services
* Operations (cohorts, capacity, attendance)
* Communications & notifications
* Reporting & analytics
* Admin & governance

### 3.2 Explicitly Out of Scope

* Learning content authoring
* Assessments and grading logic
* Virtual classrooms
* Proctoring
* Building a new LMS

(All handled by Blackboard)

---

## 4. Target Users & Personas

### 4.1 Learners (B2C)

* Individuals enrolling in short programs
* Expect frictionless UX, mobile-friendly, clear outcomes

### 4.2 Corporate Clients (B2B)

* HR, L&D, or training coordinators
* Purchase seats in bulk, assign nominees, track completion

### 4.3 Program & Operations Teams

* Create offerings, manage cohorts, instructors, schedules
* Monitor capacity, attendance, exceptions

### 4.4 Finance & Management

* Revenue tracking, refunds, reconciliation
* Performance dashboards

### 4.5 Platform Administrators

* Configuration, access control, integrations, audit

---

## 5. Reference Model (Best-of-Breed)

This platform deliberately combines strengths from multiple global models:

| Capability                 | Reference Inspiration              |
| -------------------------- | ---------------------------------- |
| Learner UX & program pages | Coursera / edX                     |
| Short program structure    | edX / FutureLearn                  |
| Corporate clients (B2B)    | Udemy Business                     |
| Training operations        | Arlo                               |
| Learning delivery          | Blackboard                         |
| Payments                   | **Moyasar**, **Tabby**, **Tamara** |

---

## 6. Platform Architecture (Logical)

```
[ Web / Mobile Frontend ]
          |
[ Experience & Operations Layer ]
  - Catalog
  - Registration
  - Payments
  - CRM
  - Operations
  - Reporting
          |
[ Integrations Layer ]
  - Blackboard
  - Payment Gateways
  - Messaging
          |
[ Data & Analytics ]
```

---

## 7. Functional Requirements (Detailed)

---

### 7.1 Catalog & Program Management

**Capabilities**

* Create and manage:

  * Programs
  * Courses
  * Bundles & learning paths
* Multi-language (Arabic / English)
* Program metadata:

  * Description, outcomes, skills
  * Duration, format (online / hybrid)
  * Start dates & cohorts
  * Price & installment eligibility
  * Instructor(s)
  * Prerequisites
* SEO-friendly public pages
* Campaign tracking (UTM ready)

**Admin Controls**

* Draft / publish lifecycle
* Clone offerings
* Archive retired programs

---

### 7.2 Registration & Enrollment (B2C)

**Flow**

1. Browse catalog
2. Select cohort/date
3. Register / sign in
4. Seat reservation (time-bound)
5. Payment
6. Confirmation
7. Automatic enrollment in Blackboard

**Features**

* Waitlist when capacity is full
* Automated promotion from waitlist
* Cancellation & refund policy enforcement
* Promo codes / scholarships

---

### 7.3 Corporate Registration (B2B)

**Organization Management**

* Company profiles
* Authorized coordinators
* Multiple cost centers (optional)

**Purchase Models**

* Bulk seat purchase
* Course bundles
* Custom corporate cohorts

**Seat Assignment**

* Assign nominees immediately or later
* Replace nominees (before cutoff)
* Track utilization

**Dashboards**

* Enrollment status
* Completion rates
* Certificates issued

---

### 7.4 Payments & Financial Flows

**Supported Methods**

* Credit/Debit Cards via **Moyasar**
* Buy-Now-Pay-Later via **Tabby**
* Buy-Now-Pay-Later via **Tamara**

**Payment Rules**

* Eligibility per course
* Installment rules (price thresholds)
* Refund handling (partial / full)
* Failed payment recovery

**Finance Outputs**

* Invoices & receipts
* Payment reconciliation
* Revenue by program, cohort, client

---

### 7.5 Blackboard Integration

**Automated Actions**

* Create Blackboard user (if not exists)
* Enroll learner into correct course shell
* Assign role (learner / instructor)
* Sync completion status

**Data Sync Back**

* Attendance
* Completion
* Certificate eligibility

Blackboard remains the **system of record for learning**, while this platform remains the **system of record for enrollment and commerce**.

---

### 7.6 Certificates & Credentials

* Automatic certificate eligibility rules
* Digital certificates (PDF + verification link)
* Certificate registry per learner & organization
* Re-issue / revoke controls
* Branding & templates per program

---

### 7.7 Operations & Cohort Management

* Cohort scheduling
* Capacity limits
* Attendance tracking
* Instructor assignment
* Venue / virtual session references
* Manual overrides (force enroll, comp seats)

---

### 7.8 Communications & Notifications

* Registration confirmation
* Payment receipts
* Pre-course reminders
* Blackboard access instructions
* Completion & certificate notifications
* Admin alerts (capacity, issues)

(Channels configurable: Email, SMS, WhatsApp if approved later)

---

### 7.9 Reporting & Analytics

**Operational Reports**

* Enrollments by program/cohort
* Attendance & completion
* Capacity utilization

**Financial Reports**

* Revenue
* Refunds
* Payment method performance

**Strategic Insights**

* Demand trends
* Conversion rates
* Corporate client behavior

---

### 7.10 Admin, Governance & Security

* Role-based access control
* Audit logs
* Configuration management
* Feature toggles
* Data retention rules

---

## 8. Non-Functional Requirements

* High availability during enrollment peaks
* Scalable architecture
* API-first design
* Mobile-responsive UX
* Arabic RTL first-class support
* Observability (logs, metrics)
* Secure payment handling (PCI via gateway)

---

## 9. Phased Delivery Recommendation

### Phase 1 (MVP – Revenue Ready)

* Catalog
* Registration
* Payments (Moyasar + BNPL)
* Blackboard integration
* Certificates
* Core reporting

### Phase 2 (Scale & B2B)

* Corporate dashboards
* Bundles & learning paths
* Advanced analytics

### Phase 3 (Ecosystem)

* External partners
* White-label offerings
* Mobile app

---

## 10. Key Design Principle (This is important)

> **“This platform manages the experience, not the learning.”**

That single principle should guide **every architectural and product decision**.

---

## 11. How to Use This in Cursor IDE

* Treat this document as **`/docs/BRD.md`**
* Break requirements into Epics:

  * Catalog
  * Registration
  * Payments
  * B2B
  * Integrations
* Generate user stories directly from each section
* Use this as the **non-negotiable source of truth**

---

