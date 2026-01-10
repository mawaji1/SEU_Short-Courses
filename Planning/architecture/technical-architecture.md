# SEU Short Courses Platform — Technical Architecture Options

**Document Type:** Architecture Artifact  
**Phase:** Design & Architecture  
**Status:** Draft for Review  
**Date:** 2026-01-03

---

## 1. Purpose

This document presents technical architecture options for the SEU Short Courses Platform, respecting all Phase 0 decisions as immutable constraints.

> [!IMPORTANT]
> **Phase 0 Constraints (Non-Negotiable):**
> - Modern, cloud-ready web architecture
> - SPA-capable frontend
> - API-driven backend
> - Stateless services
> - Blackboard REST API integration
> - Platform-managed authentication (email/password)
> - SEU-approved government/hybrid cloud hosting

---

## 2. Architecture Principles

Derived from Phase 0 decisions and BRD requirements:

| Principle | Description |
|-----------|-------------|
| **API-First** | All functionality exposed via APIs; enables future mobile/partner integrations |
| **Separation of Concerns** | Clear boundaries between frontend, backend, and integrations |
| **Stateless Services** | No session state in application tier; supports horizontal scaling |
| **Security by Design** | Authentication, authorization, and audit from Day 1 |
| **Arabic-First** | RTL layout and Arabic content as primary |
| **Observable** | Logging, metrics, and tracing built-in |
| **Resilient** | Graceful degradation for external integration failures |

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                        │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                        │
│   │  Web App    │  │  Mobile     │  │  Partner    │                        │
│   │  (SPA)      │  │  (Future)   │  │  (Future)   │                        │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                        │
│          │                │                │                                │
├──────────┴────────────────┴────────────────┴────────────────────────────────┤
│                           API GATEWAY                                       │
│   - Authentication / Authorization                                          │
│   - Rate Limiting                                                           │
│   - Request Routing                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                         APPLICATION LAYER                                   │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│   │ Catalog  │ │ Regist-  │ │ Payments │ │ Learning │ │ Certif-  │        │
│   │ Service  │ │ ration   │ │ Service  │ │ Orch.    │ │ icates   │        │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                      │
│   │ Corporate│ │ Comms    │ │ Reporting│ │ Admin    │                      │
│   │ Client   │ │ Service  │ │ Service  │ │ Service  │                      │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                         DATA LAYER                                          │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│   │   Primary DB     │  │   Cache          │  │   File Storage   │         │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘         │
├─────────────────────────────────────────────────────────────────────────────┤
│                       INTEGRATION LAYER                                     │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│   │Blackboard│ │ Moyasar  │ │  Tabby   │ │  Tamara  │ │ Email/SMS│        │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Frontend Architecture Options

### 4.1 Option A: React (Recommended)

| Aspect | Assessment |
|--------|------------|
| **Maturity** | Industry-leading, massive ecosystem |
| **Talent** | Largest developer pool |
| **RTL Support** | Excellent with proper libraries |
| **SEO** | Requires SSR (Next.js) or SSG |
| **Platforms Code** | Easily adapted to component library |
| **Complexity** | Moderate |

**Recommendation:** React with Next.js for SSR/SSG capabilities.

### 4.2 Option B: Vue.js

| Aspect | Assessment |
|--------|------------|
| **Maturity** | Mature, growing ecosystem |
| **Talent** | Good availability |
| **RTL Support** | Good with proper configuration |
| **SEO** | Requires SSR (Nuxt.js) |
| **Platforms Code** | Compatible |
| **Complexity** | Lower learning curve |

### 4.3 Option C: Angular

| Aspect | Assessment |
|--------|------------|
| **Maturity** | Enterprise-grade, Google-backed |
| **Talent** | Good, especially in enterprise |
| **RTL Support** | Built-in with Angular CDK |
| **SEO** | Requires Angular Universal |
| **Platforms Code** | Compatible |
| **Complexity** | Higher, opinionated |

### 4.4 Comparison Matrix

| Criterion | React/Next.js | Vue/Nuxt | Angular |
|-----------|---------------|----------|---------|
| Ecosystem size | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Talent availability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| RTL support | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| SSR/SEO | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Learning curve | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Enterprise fit | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### 4.5 Platforms Code UI React (Official Library)

> [!IMPORTANT]
> **Mandatory Component Foundation**
> 
> The official **Platforms Code UI React** library is the selected implementation for the Saudi National Design System components.
> 
> ```bash
> npm install platformscode-new-react@latest
> ```
> 
> This library will be installed during the Implementation Phase after Design & Architecture approval.

| Aspect | Value |
|--------|-------|
| Package | `platformscode-new-react` |
| Installation | `npm install platformscode-new-react@latest` |
| Purpose | Official Saudi National Design System components for React |
| SEU Customization | SEU brand tokens applied via CSS variables / theme override |

This ensures:
- Full compliance with Platforms Code (Phase 0 requirement)
- Pre-built accessible, RTL-ready components
- Faster development (no need to build base components)
- SEU brand layer applied as theme customization

### 4.6 Recommended Frontend Stack

| Component | Recommendation | Rationale |
|-----------|----------------|-----------|
| Framework | **Next.js (React)** | Best SSR/SSG support, largest ecosystem |
| Component Library | **platformscode-new-react** | Official Platforms Code implementation (mandatory) |
| State Management | React Context + SWR/React Query | Minimal boilerplate, caching built-in |
| RTL | Built into platformscode-new-react | Native RTL support |
| Internationalization | next-intl or react-i18next | Robust AR/EN support |
| SEU Brand Layer | CSS variable overrides | Theme tokens on top of Platforms Code |

---

## 5. Backend Architecture Options

### 5.1 Architectural Pattern Options

#### Option A: Modular Monolith (Recommended for MVP)

```
┌─────────────────────────────────────────────────┐
│              Single Deployment Unit             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Catalog │ │ Regist- │ │ Payment │           │
│  │ Module  │ │ ration  │ │ Module  │           │
│  └─────────┘ └─────────┘ └─────────┘           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │Learning │ │ Comms   │ │ Admin   │           │
│  │ Module  │ │ Module  │ │ Module  │           │
│  └─────────┘ └─────────┘ └─────────┘           │
│                   │                             │
│              Shared DB                          │
└─────────────────────────────────────────────────┘
```

| Pros | Cons |
|------|------|
| Simpler deployment | Scaling granularity limited |
| Lower operational complexity | Module boundaries require discipline |
| Faster MVP delivery | Potential for coupling if not careful |
| Easier debugging | Database contention possible |

#### Option B: Microservices

| Pros | Cons |
|------|------|
| Independent scaling | Higher operational complexity |
| Technology flexibility | Distributed system challenges |
| Team autonomy | Requires mature DevOps |
| Fault isolation | Network latency |

**Recommendation:** Start with Modular Monolith for MVP. Design for future extraction to microservices if needed.

### 5.2 Backend Technology Options

#### Option A: Node.js (TypeScript)

| Aspect | Assessment |
|--------|------------|
| **Performance** | Excellent for I/O-bound workloads |
| **Talent** | Large pool, especially with frontend synergy |
| **Ecosystem** | Extensive |
| **Typing** | TypeScript provides safety |
| **Frameworks** | Express, Fastify, NestJS |

#### Option B: Python (Django/FastAPI)

| Aspect | Assessment |
|--------|------------|
| **Performance** | Good, async support in FastAPI |
| **Talent** | Good availability |
| **Ecosystem** | Mature |
| **Typing** | Optional, improving |
| **Frameworks** | Django REST, FastAPI |

#### Option C: Java/Kotlin (Spring Boot)

| Aspect | Assessment |
|--------|------------|
| **Performance** | Excellent |
| **Talent** | Strong in enterprise |
| **Ecosystem** | Very mature |
| **Typing** | Strong |
| **Frameworks** | Spring Boot |

### 5.3 Recommended Backend Stack

| Component | Recommendation | Rationale |
|-----------|----------------|-----------|
| Language | **TypeScript (Node.js)** | Frontend/backend synergy, strong ecosystem |
| Framework | **NestJS** | Enterprise patterns, modular structure, TypeScript-native |
| ORM | Prisma or TypeORM | Type-safe database access |
| API Style | REST (OpenAPI documented) | Simplicity, Blackboard compatibility |
| Validation | class-validator + class-transformer | Declarative, robust |
| Authentication | Passport.js + JWT | Flexible, stateless |

---

## 6. Data Architecture

### 6.1 Database Options

| Option | Type | Pros | Cons |
|--------|------|------|------|
| **PostgreSQL** | Relational | ACID, JSON support, mature | Scaling complexity |
| MySQL | Relational | Widespread, familiar | Less feature-rich |
| MongoDB | Document | Flexible schema | ACID less strict |

**Recommendation:** **PostgreSQL** — Robust, ACID-compliant, excellent JSON support for flexible data.

### 6.2 Data Storage Strategy

| Data Type | Storage | Rationale |
|-----------|---------|-----------|
| Transactional data | PostgreSQL | ACID compliance for payments, enrollments |
| Session/cache | Redis | Fast, stateless session tokens |
| Files (certificates, documents) | Object storage | Scalable, CDN-compatible |
| Search (catalog) | PostgreSQL full-text or Elasticsearch | Depends on scale |

### 6.3 Conceptual Data Model (Domain-Oriented)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CORE ENTITIES                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                  │
│   │   Program   │────▶│   Cohort    │────▶│   Session   │                  │
│   └─────────────┘     └─────────────┘     └─────────────┘                  │
│         │                   │                                               │
│         ▼                   ▼                                               │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                  │
│   │  Instructor │     │Registration │────▶│   Payment   │                  │
│   └─────────────┘     └─────────────┘     └─────────────┘                  │
│                             │                   │                           │
│                             ▼                   ▼                           │
│                       ┌─────────────┐     ┌─────────────┐                  │
│                       │    User     │     │   Invoice   │                  │
│                       └─────────────┘     └─────────────┘                  │
│                             │                                               │
│                             ▼                                               │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                  │
│   │Organization │────▶│ LMS Enroll  │────▶│ Certificate │                  │
│   └─────────────┘     └─────────────┘     └─────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Integration Architecture

### 7.1 Pattern: Integration Gateway

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION SERVICES                         │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐                  │
│   │Registration│  │  Payment  │  │  Learning │                  │
│   │  Service   │  │  Service  │  │  Service  │                  │
│   └─────┬─────┘  └─────┬─────┘  └─────┬─────┘                  │
│         │              │              │                         │
├─────────┴──────────────┴──────────────┴─────────────────────────┤
│                   INTEGRATION GATEWAY                           │
│   - Retry logic                                                 │
│   - Circuit breaker                                             │
│   - Rate limiting                                               │
│   - Error normalization                                         │
│   - Logging & metrics                                           │
├─────────────────────────────────────────────────────────────────┤
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│   │Blackboard│  │ Moyasar │  │  Tabby  │  │  Tamara │          │
│   │  Adapter │  │ Adapter │  │ Adapter │  │ Adapter │          │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Blackboard Integration (Per Phase 0)

| Aspect | Design |
|--------|--------|
| Protocol | REST API (Phase 0 decision) |
| Authentication | OAuth 2.0 or API key (per Blackboard docs) |
| Operations | User provisioning, enrollment, completion sync |
| Retry | Exponential backoff with jitter |
| Fallback | Queue for failed operations, manual intervention dashboard |

### 7.3 Payment Integration

| Provider | Pattern |
|----------|---------|
| Moyasar | Redirect flow or embedded form |
| Tabby | Redirect to Tabby checkout |
| Tamara | Redirect to Tamara checkout |

All payments use webhooks for confirmation with idempotency keys.

---

## 8. Security Architecture

### 8.1 Authentication (Per Phase 0)

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User ──▶ Login (email/password) ──▶ Auth Service              │
│                                            │                    │
│                                            ▼                    │
│                                      Validate Credentials       │
│                                            │                    │
│                                            ▼                    │
│                                      Issue JWT                  │
│                                       (Access + Refresh)        │
│                                            │                    │
│   User ◀────────────────────────────────────                    │
│                                                                 │
│   Subsequent requests include JWT in Authorization header       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Authorization (RBAC)

| Role | Permissions |
|------|------------|
| Learner | Browse catalog, register, pay, view own enrollments/certificates |
| Corporate Coordinator | Manage organization seats, assign nominees, view org reports |
| Operations Staff | Manage cohorts, capacity, attendance |
| Finance | View financial reports, process refunds |
| Admin | Full platform access, configuration, user management |

### 8.3 Security Controls

| Control | Implementation |
|---------|----------------|
| Transport | TLS 1.2+ mandatory |
| Password storage | bcrypt/argon2 hashing |
| Session | Stateless JWT with short expiry |
| CSRF | Token-based protection |
| Rate limiting | Per-user and per-IP limits |
| Input validation | Server-side validation on all inputs |
| Audit | Log all security-relevant events |

---

## 9. Deployment Architecture

### 9.1 Environment Strategy

| Environment | Purpose | Configuration |
|-------------|---------|---------------|
| Development | Local development | Mock integrations |
| Integration | Integration testing | Sandbox integrations |
| Staging | Pre-production | Production-like, sandbox payment |
| Production | Live system | Full integrations |

### 9.2 Containerization Strategy

**Recommendation:** Docker containers orchestrated via Kubernetes (or managed equivalent).

```
┌─────────────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER                           │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    INGRESS                              │  │
│   └─────────────────────────────────────────────────────────┘  │
│                              │                                  │
│   ┌──────────────────────────┼──────────────────────────────┐  │
│   │                     SERVICES                            │  │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │  │
│   │  │ Frontend │  │ Backend  │  │  Worker  │              │  │
│   │  │ (pods)   │  │ (pods)   │  │ (pods)   │              │  │
│   │  └──────────┘  └──────────┘  └──────────┘              │  │
│   └─────────────────────────────────────────────────────────┘  │
│                              │                                  │
│   ┌──────────────────────────┼──────────────────────────────┐  │
│   │                  PERSISTENCE                            │  │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │  │
│   │  │PostgreSQL│  │  Redis   │  │  Object  │              │  │
│   │  │(managed) │  │(managed) │  │ Storage  │              │  │
│   │  └──────────┘  └──────────┘  └──────────┘              │  │
│   └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Architecture Recommendations Summary

| Layer | Recommended Option | Rationale |
|-------|-------------------|-----------|
| Frontend | **Next.js (React)** | SSR/SSG, ecosystem, RTL support |
| Backend | **NestJS (TypeScript)** | Modular, enterprise patterns, type safety |
| Database | **PostgreSQL** | ACID, JSON support, mature |
| Cache | **Redis** | Fast, stateless sessions |
| Architecture | **Modular Monolith** | MVP speed, designed for extraction |
| Containerization | **Docker + Kubernetes** | Scalable, portable |
| API Style | **REST (OpenAPI)** | Simplicity, Blackboard compatibility |

---

## 11. Decision Required

> [!IMPORTANT]
> **Architecture Decision Request**
> 
> The following framework decisions require approval before proceeding:
> 
> 1. **Frontend:** Next.js (React)
> 2. **Backend:** NestJS (TypeScript)
> 3. **Database:** PostgreSQL
> 4. **Architecture Pattern:** Modular Monolith (MVP)
> 
> Please confirm or provide alternative direction.

---

## 12. Phase 0 Compliance

| Phase 0 Decision | Architecture Alignment |
|------------------|----------------------|
| Modern, cloud-ready | ✅ Containerized, stateless |
| SPA-capable frontend | ✅ Next.js/React |
| API-driven backend | ✅ REST APIs |
| Stateless services | ✅ JWT, no server sessions |
| Blackboard REST APIs | ✅ Integration gateway pattern |
| Email/password auth | ✅ Passport.js + JWT |
| SEU-approved hosting | ✅ Kubernetes-ready for any cloud |

---

*This document is an architecture artifact and requires approval before implementation.*
