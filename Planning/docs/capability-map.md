# SEU Short Courses Platform — Capability Map

**Document Type:** Planning Artifact  
**Status:** Draft for Review  
**Last Updated:** 2026-01-03

---

## 1. Overview

This document breaks down the platform into **10 capability domains**. Each domain represents a coherent area of functionality that can be planned, designed, and delivered as a unit.

Capabilities are **not features**. They define *what the platform can do* at a conceptual level, not *how it will be implemented*.

---

## 2. Capability Domain Summary

| # | Capability Domain | Primary Phase | Business Criticality |
|---|------------------|---------------|---------------------|
| 1 | Catalog Management | Phase 1 | Critical |
| 2 | Registration & Enrollment | Phase 1 | Critical |
| 3 | Payments & Financial Flows | Phase 1 | Critical |
| 4 | Corporate Client Management | Phase 2 | High |
| 5 | Learning Orchestration (Blackboard) | Phase 1 | Critical |
| 6 | Certificates & Credentials | Phase 1 | High |
| 7 | Operations & Cohorts | Phase 1 | High |
| 8 | Communications | Phase 1 | Medium |
| 9 | Reporting & Analytics | Phase 1/2 | High |
| 10 | Governance & Admin | Phase 1 | High |

---

## 3. Capability Domain Details

---

### 3.1 Catalog Management

#### Purpose
Enable the creation, management, and presentation of short courses and training programs to prospective learners. Serve as the digital storefront for SEU's short program offerings.

#### Primary Users
| User Type | Interaction |
|-----------|-------------|
| Prospective Learners | Browse, search, filter, compare programs |
| Program Managers | Create, edit, publish, archive program content |
| Marketing Team | Manage SEO, campaigns, promotions |

#### Key Capabilities
- Program and course information management
- Multi-language content (Arabic/English)
- Instructor profiles
- Pricing and availability display
- SEO-friendly public pages
- Campaign tracking (UTM parameters)
- Draft/publish lifecycle management

#### Dependencies
| Dependency | Type | Notes |
|------------|------|-------|
| Operations & Cohorts | Internal | Cohort/schedule data feeds catalog |
| Communications | Internal | Program updates trigger notifications |
| Governance & Admin | Internal | RBAC for content management |

#### Key Risks
| Risk | Description | Mitigation |
|------|-------------|------------|
| Content quality inconsistency | Varying quality across programs | Content templates and governance |
| SEO underperformance | Low organic discovery | SEO strategy from Day 1 |
| Translation drift | Arabic/English content divergence | Translation workflow process |

---

### 3.2 Registration & Enrollment (B2C)

#### Purpose
Enable individual learners to register for programs, select cohorts, complete payments, and receive enrollment confirmation in a seamless flow.

#### Primary Users
| User Type | Interaction |
|-----------|-------------|
| Individual Learners | Register, pay, receive confirmation |
| Operations Staff | Monitor registrations, handle exceptions |
| Finance | Track registration-related revenue |

#### Key Capabilities
- User account creation and authentication
- Cohort/date selection
- Seat reservation (time-bound)
- Waitlist management
- Automatic promotion from waitlist
- Promo code application
- Registration confirmation
- Cancellation and refund handling

#### Dependencies
| Dependency | Type | Notes |
|------------|------|-------|
| Catalog Management | Internal | Program and cohort information |
| Payments & Financial Flows | Internal | Payment processing |
| Learning Orchestration | Internal | Triggers Blackboard enrollment |
| Communications | Internal | Registration confirmations |
| Operations & Cohorts | Internal | Capacity and seat management |

#### Key Risks
| Risk | Description | Mitigation |
|------|-------------|------------|
| Cart abandonment | Users drop off during registration | Streamlined flow, recovery reminders |
| Overbooking | Capacity exceeded due to race conditions | Atomic seat reservation |
| Refund disputes | Unclear cancellation policies | Clear policy display pre-purchase |

---

### 3.3 Payments & Financial Flows

#### Purpose
Process payments securely, support multiple payment methods including BNPL, handle refunds, and provide financial reconciliation data.

#### Primary Users
| User Type | Interaction |
|-----------|-------------|
| Individual Learners | Pay via card or BNPL |
| Corporate Clients | Invoice-based or bulk payments |
| Finance Team | Reconciliation, refunds, reporting |

#### Key Capabilities
- Credit/Debit card processing (Moyasar)
- Buy-Now-Pay-Later (Tabby, Tamara)
- Installment eligibility rules
- Invoice generation
- Receipt issuance
- Refund processing (full/partial)
- Failed payment recovery
- Revenue reconciliation

#### Dependencies
| Dependency | Type | Notes |
|------------|------|-------|
| Registration & Enrollment | Internal | Triggered by registration |
| Corporate Client Management | Internal | B2B payment flows |
| Reporting & Analytics | Internal | Financial reporting data |
| External: Moyasar | External | Card payment gateway |
| External: Tabby | External | BNPL provider |
| External: Tamara | External | BNPL provider |

#### Key Risks
| Risk | Description | Mitigation |
|------|-------------|------------|
| Payment gateway downtime | Revenue loss during outages | Multiple provider fallback strategy |
| BNPL default rates | Revenue collection challenges | Clear eligibility criteria |
| PCI compliance gaps | Security and regulatory risk | Use PCI-compliant gateway (no card storage) |
| Refund policy abuse | Revenue leakage | Clear refund policy with cutoffs |

---

### 3.4 Corporate Client Management (B2B)

#### Purpose
Enable organizations to purchase training seats in bulk, manage nominees, and track enrollment and completion across their workforce.

#### Primary Users
| User Type | Interaction |
|-----------|-------------|
| HR/L&D Coordinators | Purchase seats, assign employees |
| Training Managers | Track utilization and completion |
| Finance (Corporate) | Manage invoices and payments |
| SEU Account Managers | Manage corporate relationships |

#### Key Capabilities
- Organization profile management
- Authorized coordinator management
- Bulk seat purchase
- Nominee assignment and replacement
- Seat utilization tracking
- Corporate dashboards
- Custom cohort requests
- Cost center support (optional)

#### Dependencies
| Dependency | Type | Notes |
|------------|------|-------|
| Registration & Enrollment | Internal | Individual nominee enrollment |
| Payments & Financial Flows | Internal | B2B payment processing |
| Reporting & Analytics | Internal | Corporate usage reports |
| Certificates & Credentials | Internal | Corporate certificate tracking |
| Learning Orchestration | Internal | Nominee enrollment in Blackboard |

#### Key Risks
| Risk | Description | Mitigation |
|------|-------------|------------|
| Complex pricing models | Revenue leakage or disputes | Clear pricing rules engine |
| Seat underutilization | Contracted seats unused | Utilization dashboards and alerts |
| Nominee churn | High replacement rate | Replacement cutoff policies |

---

### 3.5 Learning Orchestration (Blackboard)

#### Purpose
Automate the enrollment of paid learners into Blackboard course shells, sync completion data back, and maintain enrollment records.

#### Primary Users
| User Type | Interaction |
|-----------|-------------|
| System (Automated) | User creation, enrollment, sync |
| Operations Staff | Monitor integration status, handle failures |
| Learners (Indirect) | Seamless access to Blackboard |

#### Key Capabilities
- User provisioning in Blackboard
- Course shell enrollment
- Role assignment (learner/instructor)
- Completion status sync
- Attendance data retrieval
- Certificate eligibility determination
- Integration health monitoring

#### Dependencies
| Dependency | Type | Notes |
|------------|------|-------|
| Registration & Enrollment | Internal | Triggers enrollment |
| Certificates & Credentials | Internal | Completion triggers certificate |
| External: Blackboard | External | Learning management system |

#### Key Risks
| Risk | Description | Mitigation |
|------|-------------|------------|
| API unavailability | Enrollment failures | Retry queues, alerting |
| Data sync delays | Stale completion data | Near-real-time webhooks if available |
| User matching failures | Duplicate accounts | Unique identifier strategy (email/ID) |
| API versioning changes | Integration breakage | Version monitoring, abstraction layer |

> **Decision Point:** Blackboard integration approach (REST API, LTI, Building Blocks?) requires validation with Blackboard team.

---

### 3.6 Certificates & Credentials

#### Purpose
Issue, store, and verify digital certificates for learners who complete programs. Maintain a registry of credentials for learners and organizations.

#### Primary Users
| User Type | Interaction |
|-----------|-------------|
| Learners | Receive, download, share certificates |
| Employers/Verifiers | Verify certificate authenticity |
| Operations Staff | Re-issue, revoke certificates |
| Corporate Clients | View organization certificate registry |

#### Key Capabilities
- Certificate eligibility rules
- Digital certificate generation (PDF + verification link)
- Certificate branding per program
- Learner certificate registry
- Organization certificate registry
- Re-issue and revocation
- Public verification page

#### Dependencies
| Dependency | Type | Notes |
|------------|------|-------|
| Learning Orchestration | Internal | Completion triggers eligibility |
| Communications | Internal | Certificate notification |
| Governance & Admin | Internal | Certificate template management |

#### Key Risks
| Risk | Description | Mitigation |
|------|-------------|------------|
| Certificate fraud | Fake certificates in circulation | Unique verification codes, public registry |
| Template management complexity | Inconsistent branding | Centralized template governance |

---

### 3.7 Operations & Cohorts

#### Purpose
Manage the operational aspects of training delivery including cohort scheduling, capacity management, instructor assignment, and attendance tracking.

#### Primary Users
| User Type | Interaction |
|-----------|-------------|
| Program Operations Team | Schedule cohorts, manage capacity |
| Instructors (Admin View) | View assignments |
| Operations Managers | Monitor utilization, handle exceptions |

#### Key Capabilities
- Cohort scheduling and management
- Capacity limits and enforcement
- Instructor assignment
- Venue/virtual session references
- Attendance tracking
- Manual overrides (force enroll, comp seats)
- Waitlist management coordination

#### Dependencies
| Dependency | Type | Notes |
|------------|------|-------|
| Catalog Management | Internal | Cohort data feeds catalog |
| Registration & Enrollment | Internal | Capacity enforcement |
| Learning Orchestration | Internal | Instructor enrollment in Blackboard |
| Reporting & Analytics | Internal | Operational metrics |

#### Key Risks
| Risk | Description | Mitigation |
|------|-------------|------------|
| Scheduling conflicts | Instructor or venue double-booking | Conflict detection rules |
| Capacity mismanagement | Over/under enrollment | Real-time capacity dashboards |

---

### 3.8 Communications

#### Purpose
Deliver timely notifications to learners, corporate clients, and internal teams across the registration, learning, and post-completion lifecycle.

#### Primary Users
| User Type | Interaction |
|-----------|-------------|
| Learners | Receive notifications (email, SMS) |
| Corporate Coordinators | Receive enrollment updates |
| Operations/Admin | Receive system alerts |

#### Key Capabilities
- Registration confirmation emails
- Payment receipt delivery
- Pre-course reminders
- Blackboard access instructions
- Completion and certificate notifications
- Admin alerts (capacity, failures)
- Channel configuration (Email, SMS, WhatsApp future)

#### Dependencies
| Dependency | Type | Notes |
|------------|------|-------|
| Registration & Enrollment | Internal | Registration triggers |
| Payments & Financial Flows | Internal | Payment triggers |
| Certificates & Credentials | Internal | Certificate triggers |
| Learning Orchestration | Internal | Access and completion triggers |
| External: Email Provider | External | Email delivery |
| External: SMS Provider | External | SMS delivery |

#### Key Risks
| Risk | Description | Mitigation |
|------|-------------|------------|
| Notification delivery failures | Missed critical communications | Delivery tracking, fallback channels |
| Over-communication | User fatigue | Notification preferences, throttling |
| Localization gaps | Arabic/English inconsistency | Template review process |

---

### 3.9 Reporting & Analytics

#### Purpose
Provide operational, financial, and strategic insights to stakeholders through dashboards and reports.

#### Primary Users
| User Type | Interaction |
|-----------|-------------|
| Operations Team | Enrollment and capacity reports |
| Finance Team | Revenue and reconciliation reports |
| Management | Strategic dashboards |
| Corporate Clients | Organization-specific reports |

#### Key Capabilities
- Enrollment reports (by program, cohort, time)
- Attendance and completion tracking
- Capacity utilization metrics
- Revenue reporting
- Refund tracking
- Payment method performance
- Demand trends and forecasting
- Conversion funnel analysis
- Corporate client behavior analytics

#### Dependencies
| Dependency | Type | Notes |
|------------|------|-------|
| All other capabilities | Internal | Data sources for reporting |

#### Key Risks
| Risk | Description | Mitigation |
|------|-------------|------------|
| Data quality issues | Inaccurate reporting | Data validation rules |
| Report performance | Slow dashboard loads | Aggregate data strategy |
| Scope creep (reports) | Endless report requests | Prioritized report backlog |

---

### 3.10 Governance & Admin

#### Purpose
Manage platform configuration, access control, audit trails, and operational governance.

#### Primary Users
| User Type | Interaction |
|-----------|-------------|
| Platform Administrators | Configuration, access control |
| Security/Compliance | Audit log review |
| Operations Leadership | Feature toggles, governance policies |

#### Key Capabilities
- Role-based access control (RBAC)
- Audit logging
- Configuration management
- Feature toggles
- Data retention policies
- User management
- Integration configuration

#### Dependencies
| Dependency | Type | Notes |
|------------|------|-------|
| All other capabilities | Internal | Governance applies to all |

#### Key Risks
| Risk | Description | Mitigation |
|------|-------------|------------|
| Privilege escalation | Unauthorized access | Regular access reviews |
| Audit gap | Missing critical events | Comprehensive audit logging |
| Configuration errors | System instability | Configuration change approval workflow |

---

## 4. Capability Dependency Map

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        CAPABILITY DEPENDENCY OVERVIEW                         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌───────────────────┐                    ┌───────────────────┐            │
│   │     Catalog       │◄───────────────────│   Operations &    │            │
│   │   Management      │                    │     Cohorts       │            │
│   └────────┬──────────┘                    └────────┬──────────┘            │
│            │                                        │                        │
│            ▼                                        │                        │
│   ┌───────────────────┐                             │                        │
│   │   Registration    │◄────────────────────────────┘                        │
│   │   & Enrollment    │                                                      │
│   └────────┬──────────┘                                                      │
│            │                                                                 │
│            ├─────────────────────┐                                           │
│            ▼                     ▼                                           │
│   ┌───────────────────┐ ┌───────────────────┐                               │
│   │    Payments &     │ │     Learning      │───────┐                       │
│   │  Financial Flows  │ │  Orchestration    │       │                       │
│   └───────────────────┘ └────────┬──────────┘       │                       │
│                                  │                   │                       │
│                                  ▼                   │                       │
│                         ┌───────────────────┐        │                       │
│                         │   Certificates    │◄───────┘                       │
│                         │   & Credentials   │                               │
│                         └───────────────────┘                               │
│                                                                              │
│   ┌───────────────────┐                    ┌───────────────────┐            │
│   │  Communications   │◄─ Triggered by ──►│    Reporting &    │            │
│   │                   │   all domains      │    Analytics      │            │
│   └───────────────────┘                    └───────────────────┘            │
│                                                                              │
│   ┌───────────────────┐                                                      │
│   │   Corporate       │──────► Uses Registration, Payments,                 │
│   │   Client Mgmt     │        Learning Orchestration, Certificates         │
│   └───────────────────┘                                                      │
│                                                                              │
│   ┌───────────────────┐                                                      │
│   │   Governance      │──────► Governs all capabilities                     │
│   │   & Admin         │                                                      │
│   └───────────────────┘                                                      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. External Integrations Summary

| External System | Capability Domain | Integration Purpose |
|-----------------|------------------|---------------------|
| Blackboard | Learning Orchestration | User provisioning, enrollment, completion sync |
| Moyasar | Payments & Financial Flows | Card payment processing |
| Tabby | Payments & Financial Flows | BNPL payment option |
| Tamara | Payments & Financial Flows | BNPL payment option |
| Email Provider (TBD) | Communications | Email delivery |
| SMS Provider (TBD) | Communications | SMS delivery |

---

*This document is a planning artifact and does not constitute implementation direction.*
