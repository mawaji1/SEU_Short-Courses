# SEU Short Courses Platform — Project Plan

**Document Type:** Planning Artifact  
**Status:** Draft for Review  
**Last Updated:** 2026-01-03

---

## 1. Executive Vision

Establish a centralized digital platform that manages the **full lifecycle of short courses and training programs** at Saudi Electronic University, covering discovery, registration, payments, client management, operations, reporting, and post-learning services.

> **Core Principle:** "This platform manages the experience, not the learning."

Blackboard remains the learning delivery system. This platform is the **experience, commerce, and operations layer**.

---

## 2. Project Phases & Objectives

| Phase | Name | Objective | Duration (Est.) |
|-------|------|-----------|-----------------|
| **0** | Foundations & Alignment | Finalize scope, governance, design alignment, and integration strategy | 4–6 weeks |
| **1** | MVP — Revenue Ready | Launch catalog, B2C registration, payments, Blackboard integration, certificates, core reporting | 12–16 weeks |
| **2** | Scale & B2B | Corporate dashboards, bundles, learning paths, advanced analytics | 8–12 weeks |
| **3** | Ecosystem Expansion | External partners, white-label offerings, mobile app | TBD |

---

## 3. Phase 0 — Foundations & Alignment

### 3.1 Objectives
- Finalize all planning artifacts and governance documents
- Align on design principles (Platforms Code + SEU Brand)
- Complete conceptual integration strategy
- Establish project governance and decision-making framework

### 3.2 Entry Criteria
- BRD approved and frozen
- Stakeholder alignment confirmed
- Project team assembled

### 3.3 Exit Criteria
- All Phase 0 planning artifacts approved
- Decision log reviewed and pending items resolved
- Technical architecture direction agreed
- Integration approach validated with Blackboard and payment providers
- Implementation team briefed

### 3.4 Key Deliverables
| Deliverable | Owner | Status |
|-------------|-------|--------|
| Capability Map | Product Strategy | Pending |
| Integration Strategy | Architecture | Pending |
| Design Alignment Strategy | UX Governance | Complete |
| Decision Log | PMO | Pending |
| Quality & Readiness Definition | QA Lead | Pending |
| Epics & Work Breakdown | Delivery Lead | Pending |

---

## 4. Phase 1 — MVP (Revenue Ready)

### 4.1 Objectives
- Enable learners to discover, register, pay, and access learning seamlessly
- Establish core revenue operations with Moyasar + BNPL
- Automate enrollment into Blackboard
- Issue digital certificates upon completion
- Provide core operational and financial reporting

### 4.2 Included Capabilities
| Capability | Priority | Notes |
|------------|----------|-------|
| Catalog Management | P0 | Programs, courses, multilingual pages |
| B2C Registration & Enrollment | P0 | Full registration flow with waitlist |
| Payments & Financial Flows | P0 | Moyasar, Tabby, Tamara |
| Blackboard Integration | P0 | Enrollment automation, completion sync |
| Certificates & Credentials | P0 | Digital issuance, verification |
| Core Reporting | P0 | Enrollments, revenue, capacity |
| Communications | P1 | Email notifications (core set) |
| Operations & Cohorts | P1 | Basic cohort management |
| Governance & Admin | P1 | RBAC, audit logs |

### 4.3 Excluded from Phase 1
| Capability | Reason |
|------------|--------|
| Corporate Client Management (B2B) | Deferred to Phase 2 |
| Bundles & Learning Paths | Deferred to Phase 2 |
| Advanced Analytics | Deferred to Phase 2 |
| Mobile App | Deferred to Phase 3 |
| Partner/White-Label | Deferred to Phase 3 |

### 4.4 Entry Criteria
- Phase 0 artifacts approved
- Development environment ready
- Integration sandbox access confirmed (Blackboard, payment providers)
- Design system tokens defined

### 4.5 Exit Criteria
- All P0 capabilities deployed and verified
- User acceptance testing passed
- Payment reconciliation validated
- Blackboard integration functional end-to-end
- Core reporting operational
- Production readiness review passed

### 4.6 Success Metrics
| Metric | Target |
|--------|--------|
| End-to-end registration time | < 5 minutes |
| Payment success rate | > 95% |
| Blackboard enrollment automation rate | 100% |
| Certificate issuance automation | 100% |

---

## 5. Phase 2 — Scale & B2B

### 5.1 Objectives
- Enable corporate clients to purchase, assign, and track seats at scale
- Introduce bundles and learning paths
- Provide advanced analytics for strategic decisions

### 5.2 Included Capabilities
| Capability | Priority |
|------------|----------|
| Corporate Client Management | P0 |
| Bulk Seat Purchase & Assignment | P0 |
| Corporate Dashboards | P0 |
| Bundles & Learning Paths | P1 |
| Advanced Analytics | P1 |
| Enhanced Reporting | P1 |

### 5.3 Entry Criteria
- Phase 1 stable in production
- B2B pricing model approved
- Corporate client onboarding process defined

### 5.4 Exit Criteria
- Corporate self-service operational
- At least 3 pilot corporate clients onboarded
- B2B reporting validated

---

## 6. Phase 3 — Ecosystem Expansion

### 6.1 Objectives
- Enable external training partners to offer programs
- Support white-label or co-branded offerings
- Launch dedicated mobile application

### 6.2 Scope (Conceptual)
- Partner onboarding and program publishing
- Revenue sharing and settlement
- Native mobile experience (iOS/Android)

### 6.3 Entry Criteria
- Phase 2 stable
- Partner commercials defined
- Mobile requirements gathered

---

## 7. Milestone Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PROJECT TIMELINE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Phase 0          Phase 1                   Phase 2         Phase 3        │
│  ────────         ────────                  ────────        ────────       │
│                                                                             │
│  ├── M0.1: Planning Artifacts Complete                                      │
│  ├── M0.2: Design Alignment Approved                                        │
│  ├── M0.3: Integration Strategy Validated                                   │
│  └── M0.4: Phase 0 Gate Review ─────────┐                                   │
│                                         │                                   │
│                 ├── M1.1: Catalog Live  ▼                                   │
│                 ├── M1.2: Payments Integrated                               │
│                 ├── M1.3: Blackboard Integration Complete                   │
│                 ├── M1.4: Certificates Operational                          │
│                 └── M1.5: MVP Launch ──────────────┐                        │
│                                                    │                        │
│                                    ├── M2.1: B2B Pilot ▼                    │
│                                    ├── M2.2: Bundles Live                   │
│                                    └── M2.3: Phase 2 Complete ──────┐       │
│                                                                     │       │
│                                                     ├── M3.1: Partners ▼    │
│                                                     └── M3.2: Mobile App    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Risks & Assumptions

### 8.1 Key Assumptions
| ID | Assumption |
|----|------------|
| A1 | Blackboard APIs are accessible and documented |
| A2 | SEU has established relationships with Moyasar, Tabby, Tamara |
| A3 | SEU brand guidelines are available and frozen |
| A4 | No Nafath integration required for Phase 1 |
| A5 | Arabic RTL is a first-class requirement |

### 8.2 Key Risks
| ID | Risk | Impact | Mitigation |
|----|------|--------|------------|
| R1 | Blackboard API limitations | High | Early integration POC |
| R2 | Payment provider onboarding delays | High | Parallel provider negotiation |
| R3 | Scope creep from stakeholders | Medium | Strict change control |
| R4 | Design-development misalignment | Medium | Design system freeze before dev |
| R5 | Data migration complexity (if any) | Medium | Assess legacy data early |

---

## 9. Governance & Decision Framework

### 9.1 Decision Authority
| Decision Type | Authority |
|---------------|-----------|
| Scope changes | Steering Committee |
| Phase gate approvals | Project Sponsor |
| Technical architecture | Architecture Board |
| Design deviations | UX Governance Lead |
| Integration approach | Technical Lead + Vendor |

### 9.2 Escalation Path
1. Delivery Lead → Project Manager
2. Project Manager → Project Sponsor
3. Project Sponsor → Steering Committee

---

## 10. Next Actions (Phase 0)

| # | Action | Owner | Due |
|---|--------|-------|-----|
| 1 | Finalize Capability Map | Product Strategy | Week 1 |
| 2 | Complete Integration Strategy | Architecture | Week 2 |
| 3 | Finalize Decision Log | PMO | Week 2 |
| 4 | Define Quality & Readiness Criteria | QA Lead | Week 2 |
| 5 | Complete Epics Breakdown | Delivery Lead | Week 3 |
| 6 | Phase 0 Gate Review | Steering Committee | Week 4 |

---

*This document is a planning artifact and does not constitute implementation direction.*
