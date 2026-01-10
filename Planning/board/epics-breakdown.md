# SEU Short Courses Platform — Epics & Work Breakdown

**Document Type:** Planning Artifact  
**Status:** Draft for Review  
**Last Updated:** 2026-01-03

---

## 1. Overview

This document defines **epics** derived from the capability domains. Each epic represents a coherent, deliverable body of work that can be planned and tracked.

> **This is conceptual planning only.**
> - No sprint assignments
> - No story points
> - No detailed task breakdowns in Jira/tool format

---

## 2. Epic Derivation Model

Epics are derived from capabilities using this model:

```
Capability Domain
    └── Epic (deliverable scope)
            └── High-level planning tasks (conceptual)
```

---

## 3. Phase 1 (MVP) Epics

### Epic Overview

| Epic ID | Epic Name | Source Capability | Priority | Dependencies |
|---------|-----------|-------------------|----------|--------------|
| E1.1 | Catalog Foundation | Catalog Management | P0 | None |
| E1.2 | Program Publishing | Catalog Management | P0 | E1.1 |
| E1.3 | User Authentication | Registration & Enrollment | P0 | None |
| E1.4 | B2C Registration Flow | Registration & Enrollment | P0 | E1.1, E1.3 |
| E1.5 | Card Payment Integration | Payments & Financial Flows | P0 | E1.4 |
| E1.6 | BNPL Payment Integration | Payments & Financial Flows | P0 | E1.4 |
| E1.7 | Blackboard User Provisioning | Learning Orchestration | P0 | E1.4 |
| E1.8 | Blackboard Enrollment | Learning Orchestration | P0 | E1.7 |
| E1.9 | Completion Sync | Learning Orchestration | P0 | E1.8 |
| E1.10 | Certificate Generation | Certificates & Credentials | P0 | E1.9 |
| E1.11 | Cohort Management | Operations & Cohorts | P1 | E1.1 |
| E1.12 | Core Notifications | Communications | P1 | E1.4, E1.5, E1.10 |
| E1.13 | Operational Reporting | Reporting & Analytics | P1 | E1.4, E1.8 |
| E1.14 | Financial Reporting | Reporting & Analytics | P1 | E1.5, E1.6 |
| E1.15 | Admin & RBAC | Governance & Admin | P1 | None |

---

### Epic Details (Phase 1)

---

#### E1.1 — Catalog Foundation

**Purpose:** Establish the core data structures and admin capabilities for managing programs and courses.

**Source Capability:** Catalog Management

**High-Level Planning Tasks:**
- [ ] Define program and course data model
- [ ] Design catalog admin interface (conceptual)
- [ ] Establish multi-language content strategy
- [ ] Define program lifecycle states (draft/published/archived)
- [ ] Plan SEO requirements for public pages

**Dependencies:** None (foundational epic)

**Dependent Epics:** E1.2, E1.4, E1.11

---

#### E1.2 — Program Publishing

**Purpose:** Enable public-facing catalog pages with program details, pricing, and cohort availability.

**Source Capability:** Catalog Management

**High-Level Planning Tasks:**
- [ ] Design public program page (conceptual UX)
- [ ] Define instructor profile display
- [ ] Plan search and filter capabilities
- [ ] Establish campaign tracking (UTM) support
- [ ] Define pricing display rules

**Dependencies:** E1.1 (Catalog Foundation)

**Dependent Epics:** E1.4

---

#### E1.3 — User Authentication

**Purpose:** Enable learners to create accounts and authenticate for registration.

**Source Capability:** Registration & Enrollment

**High-Level Planning Tasks:**
- [ ] Define authentication approach (email/password, social, Nafath future)
- [ ] Design user registration flow (conceptual)
- [ ] Plan email verification process
- [ ] Define password recovery flow
- [ ] Establish session management approach

**Dependencies:** None (foundational epic)

**Dependent Epics:** E1.4

> [!NOTE]  
> **Decision Required:** Authentication method strategy for Phase 1 (email/password baseline, with Nafath considered for future).

---

#### E1.4 — B2C Registration Flow

**Purpose:** Enable individual learners to select a program/cohort, reserve a seat, and proceed to payment.

**Source Capability:** Registration & Enrollment

**High-Level Planning Tasks:**
- [ ] Design end-to-end registration UX (conceptual)
- [ ] Define seat reservation mechanics (time-bound holds)
- [ ] Plan waitlist logic
- [ ] Define promo code application flow
- [ ] Establish cancellation policy display
- [ ] Plan registration confirmation experience

**Dependencies:** E1.1, E1.3

**Dependent Epics:** E1.5, E1.6, E1.7, E1.12

---

#### E1.5 — Card Payment Integration

**Purpose:** Process credit/debit card payments via Moyasar.

**Source Capability:** Payments & Financial Flows

**High-Level Planning Tasks:**
- [ ] Define checkout flow (conceptual)
- [ ] Plan Moyasar integration approach
- [ ] Define payment success/failure handling
- [ ] Establish receipt generation
- [ ] Plan refund request flow

**Dependencies:** E1.4

**Dependent Epics:** E1.14

---

#### E1.6 — BNPL Payment Integration

**Purpose:** Offer Tabby and Tamara as payment options.

**Source Capability:** Payments & Financial Flows

**High-Level Planning Tasks:**
- [ ] Define BNPL eligibility display logic
- [ ] Plan Tabby integration approach
- [ ] Plan Tamara integration approach
- [ ] Define BNPL-specific confirmation flow
- [ ] Establish eligibility rules (price threshold, program type)

**Dependencies:** E1.4

**Dependent Epics:** E1.14

---

#### E1.7 — Blackboard User Provisioning

**Purpose:** Automatically create or match user accounts in Blackboard.

**Source Capability:** Learning Orchestration

**High-Level Planning Tasks:**
- [ ] Define user matching strategy (email, national ID)
- [ ] Plan user creation workflow
- [ ] Define error handling for provisioning failures
- [ ] Establish retry and alerting approach

**Dependencies:** E1.4

**Dependent Epics:** E1.8

---

#### E1.8 — Blackboard Enrollment

**Purpose:** Automatically enroll paid learners into the correct Blackboard course shell.

**Source Capability:** Learning Orchestration

**High-Level Planning Tasks:**
- [ ] Define course mapping strategy (platform cohort → BB course)
- [ ] Plan enrollment request workflow
- [ ] Define role assignment (learner vs instructor)
- [ ] Establish enrollment confirmation handling
- [ ] Plan withdrawal/cancellation handling

**Dependencies:** E1.7

**Dependent Epics:** E1.9, E1.13

---

#### E1.9 — Completion Sync

**Purpose:** Sync completion status from Blackboard to enable certificate issuance.

**Source Capability:** Learning Orchestration

**High-Level Planning Tasks:**
- [ ] Define completion criteria
- [ ] Plan sync mechanism (webhook vs polling)
- [ ] Define data mapping (BB completion → platform status)
- [ ] Establish sync frequency/latency requirements

**Dependencies:** E1.8

**Dependent Epics:** E1.10

---

#### E1.10 — Certificate Generation

**Purpose:** Generate and deliver digital certificates to learners upon completion.

**Source Capability:** Certificates & Credentials

**High-Level Planning Tasks:**
- [ ] Define certificate eligibility rules
- [ ] Design certificate template approach
- [ ] Plan PDF generation mechanism
- [ ] Define verification link/code strategy
- [ ] Plan certificate delivery (notification integration)
- [ ] Establish re-issue and revocation workflow

**Dependencies:** E1.9

**Dependent Epics:** E1.12

---

#### E1.11 — Cohort Management

**Purpose:** Enable operations teams to schedule and manage cohorts.

**Source Capability:** Operations & Cohorts

**High-Level Planning Tasks:**
- [ ] Define cohort data model
- [ ] Design cohort admin interface (conceptual)
- [ ] Plan capacity management approach
- [ ] Define instructor assignment workflow
- [ ] Establish venue/virtual session tracking

**Dependencies:** E1.1

**Dependent Epics:** E1.4 (indirect)

---

#### E1.12 — Core Notifications

**Purpose:** Deliver essential notifications across the registration and completion journey.

**Source Capability:** Communications

**High-Level Planning Tasks:**
- [ ] Define notification template list (MVP)
- [ ] Plan email provider integration
- [ ] Design notification content (conceptual)
- [ ] Establish delivery tracking approach
- [ ] Define localization (Arabic/English)

**Dependencies:** E1.4, E1.5, E1.10

**Dependent Epics:** None

**MVP Notification Templates:**
| Template | Trigger |
|----------|---------|
| Registration confirmation | Payment success |
| Payment receipt | Payment success |
| Blackboard access instructions | Enrollment complete |
| Course reminder | X days before start |
| Completion congratulations | Completion sync |
| Certificate delivery | Certificate generated |

---

#### E1.13 — Operational Reporting

**Purpose:** Provide core operational visibility (enrollments, capacity, attendance).

**Source Capability:** Reporting & Analytics

**High-Level Planning Tasks:**
- [ ] Define operational report list (MVP)
- [ ] Plan data aggregation approach
- [ ] Design report interface (conceptual)
- [ ] Establish refresh frequency

**Dependencies:** E1.4, E1.8

**Dependent Epics:** None

---

#### E1.14 — Financial Reporting

**Purpose:** Provide revenue visibility and reconciliation support.

**Source Capability:** Reporting & Analytics

**High-Level Planning Tasks:**
- [ ] Define financial report list (MVP)
- [ ] Plan revenue aggregation by program/cohort/date
- [ ] Plan payment method breakdown
- [ ] Define refund tracking approach

**Dependencies:** E1.5, E1.6

**Dependent Epics:** None

---

#### E1.15 — Admin & RBAC

**Purpose:** Establish platform governance with role-based access control and audit logging.

**Source Capability:** Governance & Admin

**High-Level Planning Tasks:**
- [ ] Define role matrix (admin, operations, finance)
- [ ] Plan RBAC implementation approach
- [ ] Define audit logging scope
- [ ] Establish configuration management approach

**Dependencies:** None (foundational epic)

**Dependent Epics:** All admin interfaces

---

## 4. Epic Dependency Graph (Phase 1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PHASE 1 EPIC DEPENDENCIES                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   E1.1 Catalog Foundation ─────────┬──────────────► E1.2 Program Publishing │
│            │                       │                        │               │
│            │                       │                        │               │
│            └───────────────────────┼────────────────────────┘               │
│                                    │                                        │
│   E1.3 User Auth ─────────────────►│                                        │
│                                    │                                        │
│                                    ▼                                        │
│                         E1.4 B2C Registration                               │
│                                    │                                        │
│              ┌─────────────────────┼─────────────────────┐                  │
│              │                     │                     │                  │
│              ▼                     ▼                     ▼                  │
│   E1.5 Card Payment     E1.6 BNPL Payment     E1.7 BB User Provisioning     │
│              │                     │                     │                  │
│              │                     │                     ▼                  │
│              │                     │           E1.8 BB Enrollment           │
│              │                     │                     │                  │
│              │                     │                     ▼                  │
│              │                     │           E1.9 Completion Sync         │
│              │                     │                     │                  │
│              │                     │                     ▼                  │
│              │                     │           E1.10 Certificate Gen        │
│              │                     │                     │                  │
│              ▼                     ▼                     ▼                  │
│           E1.14 Financial ◄────────┘                     │                  │
│           Reporting                                      │                  │
│                                                          ▼                  │
│   E1.13 Operational Reporting ◄──────────────────────────┘                  │
│                                                                             │
│   E1.12 Core Notifications ◄──── Triggered by E1.4, E1.5, E1.10             │
│                                                                             │
│   E1.11 Cohort Mgmt ◄──── E1.1                                              │
│                                                                             │
│   E1.15 Admin & RBAC ◄──── Foundational, governs all admin interfaces       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Phase 2 Epics (Preview)

| Epic ID | Epic Name | Source Capability | Dependencies |
|---------|-----------|-------------------|--------------|
| E2.1 | Corporate Client Onboarding | Corporate Client Mgmt | E1.3, E1.15 |
| E2.2 | Bulk Seat Purchase | Corporate Client Mgmt | E2.1, E1.5 |
| E2.3 | Nominee Assignment | Corporate Client Mgmt | E2.2, E1.4 |
| E2.4 | Corporate Dashboards | Corporate Client Mgmt | E2.1, E1.13 |
| E2.5 | Bundles & Learning Paths | Catalog Management | E1.1, E1.2 |
| E2.6 | Advanced Analytics | Reporting & Analytics | E1.13, E1.14 |

---

## 6. Cross-Cutting Concerns

These are not standalone epics but considerations that span multiple epics:

| Concern | Relevant Epics | Notes |
|---------|---------------|-------|
| Arabic RTL Support | All UI epics | First-class requirement throughout |
| Accessibility (A11y) | All UI epics | WCAG compliance per Platforms Code |
| Mobile Responsiveness | All UI epics | Required for public pages |
| Localization (AR/EN) | E1.1, E1.2, E1.12 | Content and notifications |
| Security (RBAC) | E1.15, all admin | Governs all admin capabilities |
| Performance | All epics | SLAs to be defined |

---

*This document is a planning artifact and does not constitute implementation direction.*
