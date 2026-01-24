# SEU Short Courses Platform — Decision Log

**Document Type:** Planning Artifact  
**Status:** Living Document  
**Last Updated:** 2026-01-23

---

## 1. Overview

This document tracks all significant decisions related to the SEU Short Courses Platform. Decisions are categorized as:

- **MADE** — Decision is final and binding
- **PENDING** — Decision is required before proceeding
- **DEFERRED** — Decision intentionally postponed to a later phase

---

## 2. Decision Log Summary

| Category | Made | Pending | Deferred |
|----------|------|---------|----------|
| Strategic | 7 | 0 | 0 |
| Integration | 6 | 2 | 1 |
| Product | 8 | 2 | 2 |
| Technical | 7 | 0 | 3 |
| UX/Design | 6 | 0 | 0 |

> [!IMPORTANT]
> **Scope Finalized (2026-01-23)** — Major changes: Blackboard removed, HyperPay replaces Moyasar, Zoom added, B2B in MVP.

---

## 3. Decisions Made

### Strategic Decisions

| ID | Decision | Rationale | Date | Owner |
|----|----------|-----------|------|-------|
| D-S01 | **~~Blackboard retained as LMS~~ REMOVED** | ~~Existing investment~~ → Full learning delivery in-platform | 2026-01-23 | Stakeholder |
| D-S02 | **Platform manages full learning lifecycle** | Scope expanded to include live training delivery | 2026-01-23 | Architecture |
| D-S03 | **Individual + Corporate (B2B) support required** | Business model requires both segments | BRD | Business |
| D-S04 | **Arabic is primary language; English secondary** | Saudi market, institutional requirement | BRD | Product |
| D-S05 | **Phased delivery approach** | Start with MVP, expand to B2B, then ecosystem | BRD | PMO |
| D-S06 | **B2B Coordinator Portal in MVP** | Client requirement; moved from Phase 2 | 2026-01-23 | Product |
| D-S07 | **Live training format (synchronous only)** | All training via live Zoom sessions | 2026-01-23 | Product |

### Integration Decisions

| ID | Decision | Rationale | Date | Owner |
|----|----------|-----------|------|-------|
| D-I01 | **~~Moyasar~~ HyperPay for card payments** | Client preference; HyperPay replaces Moyasar | 2026-01-23 | Finance |
| D-I02 | **Tabby + Tamara for BNPL** | Market-leading BNPL providers in Saudi | BRD | Finance |
| D-I03 | **~~Blackboard REST APIs~~ REMOVED** | Learning delivery now in-platform | 2026-01-23 | Architecture |
| D-I04 | **Zoom Meeting SDK + API for live training** | Embedded sessions, automatic attendance tracking | 2026-01-23 | Architecture |
| D-I05 | **Zoom webhooks for attendance** | Automatic participant tracking via webhooks | 2026-01-23 | Architecture |
| D-I06 | **Zoom Pro licenses for instructors** | ~15-17 licenses for concurrent courses | 2026-01-23 | Operations |

### Product Decisions

| ID | Decision | Rationale | Date | Owner |
|----|----------|-----------|------|-------|
| D-P01 | **Nafath NOT required for Phase 1** | Simplify registration; assess for future | BRD | Product |
| D-P02 | **Certificates are digital (PDF + verification)** | Modern approach, verifiable credentials | BRD | Product |
| D-P03 | **Multi-language content** | Arabic/English bilingual requirement | BRD | Product |
| D-P04 | **BNPL enabled only for paid public courses** | Minimum price threshold required; disabled for free courses, corporate bulk, custom cohorts | 2026-01-03 | Product + Finance |
| D-P05 | **Standardized refund policy** | Full refund before cutoff (course start – N days); no refund after course start; BNPL follows provider workflows | 2026-01-03 | Finance + Legal |
| D-P06 | **SEU brand assets confirmed available** | Located in `ui/` folder: logos (PNG, AI), color palettes, decorative elements | 2026-01-03 | Brand |
| D-P07 | **Approval workflows for risky operations** | Refunds, cancellations, bulk enrollment, certificate overrides require approval | 2026-01-23 | Operations |
| D-P08 | **Instructor portal with messaging** | Materials upload, attendance tracking, learner messaging | 2026-01-23 | Product |

### Technical Decisions

| ID | Decision | Rationale | Date | Owner |
|----|----------|-----------|------|-------|
| D-T01 | **Modern cloud-ready web architecture** | SPA-capable frontend, API-driven backend, stateless services, externalized integrations | 2026-01-03 | Architecture |
| D-T02 | **SEU-approved government/hybrid cloud hosting** | Compliant with Saudi data residency; exact environment (on-prem/private/hybrid) finalized by SEU IT | 2026-01-03 | Infrastructure |
| D-T03 | **Platform-managed authentication (email/password)** | Fastest MVP path; RBAC with separate learner/coordinator roles | 2026-01-03 | Architecture |
| D-T04 | **Frontend: Next.js (React)** | Best SSR/SSG support, largest ecosystem, excellent RTL support | 2026-01-03 | Architecture |
| D-T05 | **Backend: NestJS (TypeScript)** | Enterprise patterns, modular structure, TypeScript-native, frontend synergy | 2026-01-03 | Architecture |
| D-T06 | **Database: PostgreSQL** | ACID-compliant, excellent JSON support, mature ecosystem | 2026-01-03 | Architecture |
| D-T07 | **Architecture: Modular Monolith (MVP)** | Faster MVP delivery, simpler operations, designed for future extraction | 2026-01-03 | Architecture |

### UX/Design Decisions

| ID | Decision | Rationale | Date | Owner |
|----|----------|-----------|------|-------|
| D-U01 | **Platforms Code as UX foundation** | Government digital consistency, accessibility | Design Gov | UX |
| D-U02 | **SEU brand as visual overlay** | Institutional identity, brand continuity | Design Gov | UX |
| D-U03 | **Layered design model** | National UX patterns + SEU identity + product UX | Design Gov | UX |
| D-U04 | **Platforms Code is mandatory** | Non-negotiable UX foundation with SEU brand layered on top | 2026-01-03 | UX Governance |
| D-U05 | **Brand assets ready for design phase** | Logos, color palettes, and decorative elements available in `ui/` folder | 2026-01-03 | Brand |
| D-U06 | **platformscode-new-react as component library** | Official Platforms Code React implementation; SEU tokens applied via CSS variable overrides | 2026-01-03 | Architecture |

---

## 4. Decisions Pending

### Integration Decisions

| ID | Decision Required | Impact | Blocking | Proposed Owner | Due |
|----|-------------------|--------|----------|----------------|-----|
| D-I10 | Email provider selection | Implementation | No | IT/Infrastructure | Phase 1 start |
| D-I11 | SMS provider selection | Implementation | No | IT/Infrastructure | Phase 1 start |

### Product Decisions

| ID | Decision Required | Impact | Blocking | Proposed Owner | Due |
|----|-------------------|--------|----------|----------------|-----|
| D-P10 | BNPL minimum price threshold (exact SAR value) | Product config | No | Product + Finance | Phase 1 |
| D-P11 | Refund cutoff period (exact N days) | Product rules | No | Finance + Legal | Phase 1 |

---

## 5. Decisions Deferred

### Integration Decisions

| ID | Decision | Deferred To | Reason |
|----|----------|-------------|--------|
| D-I50 | WhatsApp channel implementation | Phase 2+ | Requires approval process, not MVP critical |

### Product Decisions

| ID | Decision | Deferred To | Reason |
|----|----------|-------------|--------|
| D-P50 | Bundles & learning paths structure | Phase 2 | B2B scope |
| D-P51 | Partner/white-label model | Phase 3 | Ecosystem expansion scope |

### Technical Decisions

| ID | Decision | Deferred To | Reason |
|----|----------|-------------|--------|
| D-T50 | Mobile application platform (native vs hybrid) | Phase 3 | Mobile app in Phase 3 scope |
| D-T51 | Multi-tenancy architecture (for partnerships) | Phase 3 | Partner/white-label scope |
| D-T52 | Hijri calendar support | Future | Not MVP critical |

---

## 6. Phase 0 Closure Summary

> [!NOTE]
> **All Phase 0 blocking decisions have been resolved.**

| Decision Area | Status | Reference |
|---------------|--------|-----------|
| ~~Blackboard integration~~ | ❌ REMOVED | D-I03 (Now in-platform) |
| Zoom integration | ✅ Added | D-I04, D-I05 |
| Payment provider | ✅ Changed | D-I01 (HyperPay) |
| Technical stack direction | ✅ Closed | D-T01 (Modern cloud-ready) |
| Hosting strategy | ✅ Closed | D-T02 (SEU-approved cloud) |
| Authentication approach | ✅ Closed | D-T03 (Email/password + RBAC) |
| BNPL eligibility rules | ✅ Closed | D-P04 (Paid public courses only) |
| Refund policy | ✅ Closed | D-P05 (Standardized policy) |
| Brand assets availability | ✅ Closed | D-P06, D-U05 (Available in `ui/`) |
| Design system foundation | ✅ Closed | D-U04 (Platforms Code mandatory) |
| B2B in MVP | ✅ Added | D-S06 |

➡️ **Phase 0 Gate criteria met.**

---

## 7. Design & Architecture Closure Summary

> [!NOTE]
> **All Design & Architecture decisions approved and locked.**

| Decision | Approved Value | Reference |
|----------|----------------|----------|
| Frontend Framework | Next.js (React) | D-T04 |
| Backend Framework | NestJS (TypeScript) | D-T05 |
| Database | PostgreSQL | D-T06 |
| Architecture Pattern | Modular Monolith (MVP) | D-T07 |
| Component Library | platformscode-new-react | D-U06 |
| Design System | Token strategy with SEU brand overlay | design-system-tokens.md |

➡️ **Design & Architecture complete. Implementation authorized.**

---

## 7. Decision Request Template

When raising a new decision for the log:

```
| Field | Entry |
|-------|-------|
| Decision ID | D-[Category][Number] |
| Decision Required | [Clear statement of what needs to be decided] |
| Context | [Background and why decision is needed] |
| Options | [List of options with pros/cons] |
| Recommendation | [Proposed option if any] |
| Impact | [What happens if not decided] |
| Blocking | [Yes/No] |
| Proposed Owner | [Who should decide] |
| Due Date | [When decision is needed by] |
```

---

## 8. Decision Escalation Path

1. **Product/UX decisions** → Product Owner → Project Sponsor
2. **Technical decisions** → Architecture Lead → Technical Director
3. **Financial decisions** → Finance Lead → CFO
4. **Strategic/scope decisions** → Project Sponsor → Steering Committee

---

## 9. Brand Assets Reference

| Asset Type | Location | Status |
|------------|----------|--------|
| SEU Logo (PNG) | [seulogo-png.png](file:///Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/ui/seulogo-png.png) | ✅ Available |
| SEU Logo (AI) | [seulogo-ai.ai](file:///Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/ui/seulogo-ai.ai) | ✅ Available |
| Round AI Logo | [round-ai.ai](file:///Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/ui/round-ai.ai) | ✅ Available |
| Color Palette 1 | [Color Palette1.jpg.avif](file:///Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/ui/theme/Color%20Palette1.jpg.avif) | ✅ Available |
| Color Palette 2 | [Color Palette2.jpg.avif](file:///Users/mawaji/Desktop-corrupted/Projects/SEU_ShorCourses/ui/theme/Color%20Palette2.jpg.avif) | ✅ Available |
| Decorative Elements | `ui/theme/decorative*.avif`, `id*.avif` | ✅ Available |

---

*This document is a living planning artifact and should be updated as decisions are made.*
