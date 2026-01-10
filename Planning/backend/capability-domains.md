# SEU Short Courses Platform — Capability Domains (Backend Perspective)

**Document Type:** Planning Artifact  
**Status:** Draft for Review  
**Last Updated:** 2026-01-03

---

## 1. Overview

This document provides a **backend-oriented view** of the capability domains. It describes the conceptual system thinking for each capability without specifying technology stack, API endpoints, or data schemas.

> **Note:** This is architectural thinking, not technical specification.

---

## 2. Domain Boundaries & Responsibilities

### 2.1 Domain Thinking Approach

Each capability domain should be thought of as a bounded context with:

- **Clear responsibility** — What does this domain own?
- **Internal logic** — What decisions does it make?
- **Interfaces** — How does it communicate with other domains?
- **Data ownership** — What entities does it manage?

### 2.2 Domain Summary

| Domain | Core Responsibility | Key Entities (Conceptual) |
|--------|---------------------|--------------------------|
| Catalog | Program definition and presentation | Programs, Courses, Bundles, Instructors |
| Registration | Learner registration lifecycle | Registrations, Seats, Waitlist |
| Payments | Financial transactions | Orders, Payments, Refunds, Invoices |
| Corporate | Organization management | Organizations, Coordinators, Seat Allocations |
| Learning | Blackboard orchestration | Enrollments, Completion Records |
| Certificates | Credential management | Certificates, Verification Codes |
| Operations | Cohort and capacity management | Cohorts, Sessions, Instructors, Venues |
| Communications | Notification delivery | Notification Events, Templates |
| Reporting | Data aggregation and insights | Reports, Metrics, Dashboards |
| Governance | Platform administration | Users, Roles, Audit Logs, Configurations |

---

## 3. Domain Details

---

### 3.1 Catalog Domain

**Responsibility:** Define and present short course offerings.

#### Conceptual Entities
| Entity | Description |
|--------|-------------|
| Program | Top-level training offering |
| Course | A unit within a program |
| Bundle | A collection of programs/courses |
| Instructor | Subject matter expert |

#### Key Logic
- Program lifecycle management (draft → published → archived)
- Multilingual content handling
- Pricing rules and display
- Search and filtering

#### Interfaces
| Interface Direction | With Domain | Purpose |
|--------------------|-------------|---------|
| Provides data to | Registration | Available programs and cohorts |
| Receives data from | Operations | Cohort schedules and availability |

#### Considerations
- SEO requirements for public pages
- Content governance workflows
- Instructor profile management

---

### 3.2 Registration Domain

**Responsibility:** Manage the learner registration lifecycle from intent to confirmation.

#### Conceptual Entities
| Entity | Description |
|--------|-------------|
| Registration | A learner's enrollment in a program cohort |
| Seat Reservation | Time-bound hold on capacity |
| Waitlist Entry | Position in queue when capacity is full |
| Promo Application | Applied promotional code |

#### Key Logic
- Seat availability check and reservation
- Reservation timeout handling
- Waitlist promotion logic
- Promo code validation
- Cancellation policy enforcement

#### Interfaces
| Interface Direction | With Domain | Purpose |
|--------------------|-------------|---------|
| Queries | Catalog | Program/cohort availability |
| Triggers | Payments | Payment initiation |
| Triggers | Learning | Enrollment request |
| Receives confirmation from | Payments | Payment success |
| Receives confirmation from | Learning | Enrollment confirmation |
| Notifies | Communications | Registration events |

#### Considerations
- Race condition handling for seat reservations
- Cart abandonment recovery
- Multi-step flow state management

---

### 3.3 Payments Domain

**Responsibility:** Process financial transactions and manage financial records.

#### Conceptual Entities
| Entity | Description |
|--------|-------------|
| Order | A financial transaction for registration(s) |
| Payment | A specific payment attempt/success |
| Invoice | Financial document for the transaction |
| Refund | A reversal of payment |

#### Key Logic
- Payment method eligibility (card, BNPL)
- BNPL eligibility evaluation
- Installment rule application
- Refund calculation and processing
- Failed payment retry

#### Interfaces
| Interface Direction | With Domain | Purpose |
|--------------------|-------------|---------|
| Receives request from | Registration | Payment initiation |
| Integrates with | External: Moyasar | Card processing |
| Integrates with | External: Tabby | BNPL processing |
| Integrates with | External: Tamara | BNPL processing |
| Confirms to | Registration | Payment success/failure |
| Notifies | Communications | Payment events |
| Provides data to | Reporting | Financial metrics |

#### Considerations
- PCI compliance (card data never stored)
- Idempotency for payment operations
- Reconciliation data for finance
- Currency handling (SAR)

---

### 3.4 Corporate Domain

**Responsibility:** Manage B2B relationships and bulk seat management.

#### Conceptual Entities
| Entity | Description |
|--------|-------------|
| Organization | A corporate client |
| Coordinator | Authorized representative |
| Seat Allocation | Purchased seats for a program |
| Nominee Assignment | Individual assigned to a seat |

#### Key Logic
- Organization onboarding and verification
- Coordinator authorization
- Bulk seat pricing
- Nominee assignment and replacement rules
- Seat utilization tracking

#### Interfaces
| Interface Direction | With Domain | Purpose |
|--------------------|-------------|---------|
| Triggers | Registration | Individual nominee registration |
| Triggers | Payments | B2B payment processing |
| Queries | Learning | Nominee completion status |
| Queries | Certificates | Organization certificate registry |
| Provides data to | Reporting | Corporate utilization metrics |

#### Considerations
- Multi-coordinator support
- Cost center allocation (future)
- Contract and pricing management
- Custom cohort requests

---

### 3.5 Learning Domain

**Responsibility:** Orchestrate enrollment with Blackboard and sync learning data.

#### Conceptual Entities
| Entity | Description |
|--------|-------------|
| LMS Enrollment | A learner's enrollment in Blackboard |
| Completion Record | Status from Blackboard |
| Attendance Record | Attendance data from Blackboard |

#### Key Logic
- User provisioning in Blackboard
- Course shell mapping
- Role assignment
- Completion status interpretation
- Certificate eligibility determination

#### Interfaces
| Interface Direction | With Domain | Purpose |
|--------------------|-------------|---------|
| Receives request from | Registration | Enrollment trigger |
| Integrates with | External: Blackboard | LMS operations |
| Triggers | Certificates | Eligibility notification |
| Provides data to | Reporting | Completion metrics |
| Notifies | Communications | Access and completion events |

#### Considerations
- API reliability and retry handling
- User matching (email, national ID)
- Sync latency management
- Course shell lifecycle

---

### 3.6 Certificates Domain

**Responsibility:** Generate, store, and verify digital credentials.

#### Conceptual Entities
| Entity | Description |
|--------|-------------|
| Certificate | A digital credential document |
| Verification Code | Unique code for verification |
| Template | Certificate design template |

#### Key Logic
- Eligibility rule evaluation
- Template selection and rendering
- Unique verification code generation
- Public verification
- Re-issue and revocation

#### Interfaces
| Interface Direction | With Domain | Purpose |
|--------------------|-------------|---------|
| Receives trigger from | Learning | Eligibility notification |
| Provides data to | Corporate | Organization certificate registry |
| Notifies | Communications | Certificate issuance |
| Provides | External: Public | Verification page |

#### Considerations
- Template management and branding
- PDF generation at scale
- Verification page security
- Revocation handling

---

### 3.7 Operations Domain

**Responsibility:** Manage cohorts, capacity, instructors, and scheduling.

#### Conceptual Entities
| Entity | Description |
|--------|-------------|
| Cohort | A scheduled instance of a program |
| Session | A specific class session within a cohort |
| Instructor Assignment | Instructor linked to cohort |
| Venue | Physical or virtual location |

#### Key Logic
- Cohort scheduling
- Capacity management
- Instructor availability
- Session scheduling
- Attendance tracking

#### Interfaces
| Interface Direction | With Domain | Purpose |
|--------------------|-------------|---------|
| Provides data to | Catalog | Cohort availability |
| Informs | Registration | Capacity limits |
| Provides data to | Learning | Instructor enrollment |
| Provides data to | Reporting | Operational metrics |

#### Considerations
- Scheduling conflicts detection
- Capacity exception handling
- Manual override support
- Venue/session reference tracking

---

### 3.8 Communications Domain

**Responsibility:** Deliver notifications across channels.

#### Conceptual Entities
| Entity | Description |
|--------|-------------|
| Notification Event | A triggered notification request |
| Template | Message template with placeholders |
| Delivery Record | Status of delivery attempt |

#### Key Logic
- Template rendering with personalization
- Channel selection (email, SMS)
- Delivery orchestration
- Retry and fallback handling
- Preference management

#### Interfaces
| Interface Direction | With Domain | Purpose |
|--------------------|-------------|---------|
| Receives events from | All domains | Notification triggers |
| Integrates with | External: Email Provider | Email delivery |
| Integrates with | External: SMS Provider | SMS delivery |

#### Considerations
- Localization (Arabic/English)
- Delivery tracking and monitoring
- Bounce and complaint handling
- Throttling and rate limits

---

### 3.9 Reporting Domain

**Responsibility:** Aggregate data and provide insights.

#### Conceptual Entities
| Entity | Description |
|--------|-------------|
| Report Definition | Configuration for a report |
| Report Instance | A generated report |
| Dashboard | Collection of visualizations |
| Metric | A calculated KPI |

#### Key Logic
- Data aggregation from source domains
- Report generation (on-demand, scheduled)
- Access control for reports
- Export capabilities

#### Interfaces
| Interface Direction | With Domain | Purpose |
|--------------------|-------------|---------|
| Queries | All domains | Data sourcing |
| Provides | Users | Reports and dashboards |

#### Considerations
- Query performance optimization
- Data freshness vs. cost tradeoffs
- Report scope governance
- BI tool integration (future)

---

### 3.10 Governance Domain

**Responsibility:** Manage platform configuration, access, and audit.

#### Conceptual Entities
| Entity | Description |
|--------|-------------|
| User | An authenticated platform user |
| Role | A set of permissions |
| Permission | Access to a specific action |
| Audit Log | Record of significant actions |
| Configuration | Platform setting |

#### Key Logic
- Role-based access control (RBAC)
- Authentication management
- Audit event capture
- Configuration management
- Feature toggle control

#### Interfaces
| Interface Direction | With Domain | Purpose |
|--------------------|-------------|---------|
| Provides to | All domains | Authorization checks |
| Receives from | All domains | Auditable events |

#### Considerations
- Least privilege principle
- Comprehensive audit coverage
- Configuration change tracking
- Emergency access procedures

---

## 4. Cross-Cutting Concerns

| Concern | Description | Ownership |
|---------|-------------|-----------|
| Authentication | User identity verification | Governance Domain |
| Authorization | Access control | Governance Domain |
| Localization | Arabic/English content | All domains |
| Logging | Application logging | All domains → Central |
| Metrics | Performance and business metrics | All domains → Reporting |
| Error Handling | Consistent error responses | All domains |
| Security | Input validation, encryption | All domains |

---

## 5. Domain Communication Patterns (Conceptual)

```
┌─────────────────────────────────────────────────────────────────┐
│                   DOMAIN COMMUNICATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Synchronous Queries                                           │
│   ─────────────────                                             │
│   Registration → Catalog (availability check)                   │
│   Registration → Operations (capacity check)                    │
│                                                                 │
│   Event-Based Triggers                                          │
│   ───────────────────                                           │
│   Registration → Payments (payment request)                     │
│   Payments → Registration (payment confirmation)                │
│   Registration → Learning (enrollment request)                  │
│   Learning → Certificates (eligibility)                         │
│   All → Communications (notification events)                    │
│                                                                 │
│   External Integrations                                         │
│   ─────────────────────                                         │
│   Payments ↔ Moyasar, Tabby, Tamara                             │
│   Learning ↔ Blackboard                                         │
│   Communications ↔ Email/SMS Providers                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

*This document is a planning artifact and does not constitute technical architecture.*
