# SEU Short Courses Platform — Conceptual Integration Strategy

**Document Type:** Planning Artifact  
**Status:** Draft for Review  
**Last Updated:** 2026-01-03

---

## 1. Overview

This document defines the **conceptual integration strategy** for the SEU Short Courses Platform. It describes why each integration exists, what data flows conceptually, and which system serves as the system of record.

> **This document does NOT define:**
> - API endpoints or protocols
> - Data schemas or field mappings
> - Technical implementation details

---

## 2. Integration Landscape

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SEU SHORT COURSES PLATFORM                              │
│                     (Experience & Commerce Layer)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                    │
│   │  Blackboard │    │   Moyasar   │    │ Tabby/Tamara│                    │
│   │   (LMS)     │    │ (Payments)  │    │   (BNPL)    │                    │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                    │
│          │                  │                  │                            │
│          ▼                  ▼                  ▼                            │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │                    Integration Layer                             │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│          │                  │                  │                            │
│          ▼                  ▼                  ▼                            │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                    │
│   │ Enrollment  │    │  Checkout   │    │   Revenue   │                    │
│   │ Automation  │    │    Flow     │    │   Reports   │                    │
│   └─────────────┘    └─────────────┘    └─────────────┘                    │
│                                                                             │
│   ┌─────────────┐    ┌─────────────┐                                       │
│   │    Email    │    │     SMS     │                                       │
│   │  Provider   │    │  Provider   │                                       │
│   └─────────────┘    └─────────────┘                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Blackboard Integration

### 3.1 Integration Purpose

| Aspect | Description |
|--------|-------------|
| **Why it exists** | Blackboard is SEU's existing learning management system. Rather than replacing it, this platform automates enrollment and syncs completion data back to support certificates and reporting. |
| **Business value** | Eliminates manual enrollment processing, reduces errors, enables real-time completion tracking |
| **Guiding principle** | "Blackboard manages learning. This platform manages experience and commerce." |

### 3.2 Conceptual Data Flow

#### Outbound (Platform → Blackboard)

| Data Element | Purpose |
|--------------|---------|
| Learner identity | Provision user account in Blackboard if not exists |
| Course enrollment request | Enroll learner in specific course shell |
| Role assignment | Assign role (learner, instructor) |
| Enrollment removal | Withdraw canceled learners |

#### Inbound (Blackboard → Platform)

| Data Element | Purpose |
|--------------|---------|
| Enrollment confirmation | Confirm successful enrollment |
| Completion status | Determine certificate eligibility |
| Attendance data | Operational reporting |
| Course availability | Cohort scheduling alignment |

### 3.3 System of Record

| Data Type | System of Record | Notes |
|-----------|-----------------|-------|
| Learning content | Blackboard | Content authoring stays in LMS |
| Assessments & grades | Blackboard | Grading logic stays in LMS |
| Enrollment records | This Platform | Source of truth for who paid and enrolled |
| Completion status | Blackboard | Source of truth, synced to platform |
| Payment & revenue | This Platform | Financial system of record |
| Certificates issued | This Platform | Credential registry |

### 3.4 Failure & Exception Considerations

| Scenario | Impact | Consideration |
|----------|--------|---------------|
| Blackboard API unavailable | Enrollments cannot complete | Queue-based retry with alerting |
| User creation fails | Learner cannot access course | Error handling with manual fallback |
| Completion sync delays | Certificate issuance delays | Near-real-time sync or scheduled polling |
| User mismatch | Duplicate accounts | Unique identifier strategy (email/national ID) |
| Blackboard upgrade | API changes | Version monitoring, abstraction layer |

### 3.5 Open Questions

> [!IMPORTANT]  
> **Decision Required:** Which Blackboard integration approach will be used?
> - REST API
> - LTI (Learning Tools Interoperability)
> - Building Blocks / SaaS Extensions
> - Combination

> [!NOTE]  
> **Pending:** Blackboard API access and documentation availability must be confirmed with SEU IT.

---

## 4. Payment Gateway Integration (Moyasar)

### 4.1 Integration Purpose

| Aspect | Description |
|--------|-------------|
| **Why it exists** | Moyasar is a Saudi-based payment gateway that handles credit/debit card transactions with PCI compliance |
| **Business value** | Enables revenue collection without PCI compliance burden on the platform |
| **Guiding principle** | "Platform initiates payments; gateway processes and secures them." |

### 4.2 Conceptual Data Flow

#### Outbound (Platform → Moyasar)

| Data Element | Purpose |
|--------------|---------|
| Payment request | Initiate card payment for order |
| Amount and currency | Transaction value |
| Order reference | Link payment to enrollment |
| Customer metadata | For reconciliation |

#### Inbound (Moyasar → Platform)

| Data Element | Purpose |
|--------------|---------|
| Payment confirmation | Mark order as paid |
| Transaction ID | Reference for reconciliation |
| Payment failure | Trigger recovery flow |
| Refund confirmation | Update order status |

### 4.3 System of Record

| Data Type | System of Record | Notes |
|-----------|-----------------|-------|
| Card data | Moyasar | Platform never stores card details |
| Transaction status | Moyasar (source), Platform (copy) | Platform stores status for operations |
| Order/enrollment | This Platform | Links payment to registration |
| Revenue reports | This Platform | Aggregates from payment events |

### 4.4 Failure & Exception Considerations

| Scenario | Impact | Consideration |
|----------|--------|---------------|
| Gateway timeout | Payment status unknown | Idempotency keys, status polling |
| Payment declined | User cannot complete registration | Clear error messaging, retry option |
| Partial payment failure | Inconsistent state | Atomic transaction handling |
| Webhook delivery failure | Missed payment confirmations | Webhook retry + polling fallback |
| Refund processing delay | Customer complaints | Clear communication, tracking |

---

## 5. BNPL Integration (Tabby & Tamara)

### 5.1 Integration Purpose

| Aspect | Description |
|--------|-------------|
| **Why it exists** | Offer flexible payment options to increase conversion and accessibility |
| **Business value** | Higher average order value, broader customer reach |
| **Guiding principle** | "Platform offers choice; BNPL providers handle installment complexity." |

### 5.2 Conceptual Data Flow

#### Outbound (Platform → BNPL Provider)

| Data Element | Purpose |
|--------------|---------|
| Customer eligibility check | Determine if BNPL available |
| Payment request | Initiate installment plan |
| Order details | Amount, description, reference |
| Customer info | For BNPL provider KYC |

#### Inbound (BNPL Provider → Platform)

| Data Element | Purpose |
|--------------|---------|
| Eligibility response | Show/hide BNPL option |
| Payment authorization | Confirm enrollment can proceed |
| Payment completion | Mark order as paid (first installment) |
| Default notification | Risk management |

### 5.3 System of Record

| Data Type | System of Record | Notes |
|-----------|-----------------|-------|
| Installment schedule | BNPL Provider | Provider manages collections |
| Order payment status | This Platform | Enrollment proceeds on authorization |
| Customer defaults | BNPL Provider | Provider handles collections |
| Revenue (upfront) | This Platform | Settlement terms vary by provider |

### 5.4 Failure & Exception Considerations

| Scenario | Impact | Consideration |
|----------|--------|---------------|
| Eligibility declined | Customer cannot use BNPL | Clear messaging, alternative payment |
| Authorization timeout | Uncertain payment status | Status verification flow |
| Customer defaults | Revenue collection by provider | Clear settlement terms |
| Provider downtime | BNPL option unavailable | Graceful degradation (show card only) |

### 5.5 Open Questions

> [!IMPORTANT]  
> **Decision Required:** BNPL eligibility rules need definition:
> - Minimum order value for BNPL?
> - Which programs are BNPL-eligible?
> - Maximum installment period?

---

## 6. Notification Integration (Email & SMS)

### 6.1 Integration Purpose

| Aspect | Description |
|--------|-------------|
| **Why it exists** | Deliver timely, reliable notifications to learners and stakeholders |
| **Business value** | Customer engagement, operational efficiency, compliance |
| **Guiding principle** | "Platform decides what to say; notification providers deliver reliably." |

### 6.2 Conceptual Data Flow

#### Outbound (Platform → Provider)

| Data Element | Purpose |
|--------------|---------|
| Recipient | Email address or phone number |
| Template reference | Which notification type |
| Personalization data | Names, dates, links |
| Delivery preferences | Channel, priority |

#### Inbound (Provider → Platform)

| Data Element | Purpose |
|--------------|---------|
| Delivery status | Sent, delivered, failed |
| Open/click tracking | Engagement analytics (email) |
| Bounce/complaint | List hygiene |

### 6.3 System of Record

| Data Type | System of Record | Notes |
|-----------|-----------------|-------|
| Notification content | This Platform | Templates and personalization |
| Delivery status | Provider → Platform | Sync delivery events |
| Customer contact info | This Platform | Email/phone registry |

### 6.4 Failure & Exception Considerations

| Scenario | Impact | Consideration |
|----------|--------|---------------|
| Email delivery failure | Missed communication | Retry, fallback to SMS |
| SMS delivery failure | Missed communication | Alerting for critical messages |
| High bounce rate | Reputation damage | Email validation at registration |
| Template rendering error | Broken notification | Template testing pre-deployment |

### 6.5 Open Questions

> [!NOTE]  
> **Pending:** Which email and SMS providers will be used? Options may include:
> - Email: SendGrid, Amazon SES, Mailgun
> - SMS: Unifonic, Twilio, local Saudi providers

> [!NOTE]  
> **Pending:** WhatsApp channel scope and approval process for future phases.

---

## 7. Integration Principles

### 7.1 Design Principles

| Principle | Description |
|-----------|-------------|
| **Idempotency** | All operations must be safely retriable |
| **Eventual consistency** | Accept temporary delays in sync |
| **Graceful degradation** | Partial failures should not break core flows |
| **Observability** | All integrations must be monitored |
| **Circuit breaking** | Prevent cascade failures |

### 7.2 Error Handling Philosophy

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING STRATEGY                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Transient Errors ──► Automatic Retry with Backoff             │
│   (timeouts, 503s)                                              │
│                                                                 │
│   Business Errors ──► User-Facing Message + Alternative         │
│   (declined, ineligible)                                        │
│                                                                 │
│   System Errors ──► Alert + Manual Intervention Queue           │
│   (unknown failures)                                            │
│                                                                 │
│   Chronic Failures ──► Circuit Break + Alerting                 │
│   (repeated failures)                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Integration Summary Matrix

| Integration | Direction | Data Concept | SoR | Critical Path |
|-------------|-----------|--------------|-----|---------------|
| Blackboard | Bidirectional | Users, Enrollments, Completion | Split | Yes |
| Moyasar | Bidirectional | Payments, Refunds | Split | Yes |
| Tabby | Bidirectional | BNPL Payments | Split | Yes |
| Tamara | Bidirectional | BNPL Payments | Split | Yes |
| Email Provider | Outbound + Status | Notifications | Platform | No |
| SMS Provider | Outbound + Status | Notifications | Platform | No |

---

## 9. Open Decisions Summary

| # | Decision | Status | Impact |
|---|----------|--------|--------|
| 1 | Blackboard integration method (REST/LTI/BB) | Pending | Architecture |
| 2 | BNPL eligibility rules | Pending | Product configuration |
| 3 | Email provider selection | Pending | Implementation |
| 4 | SMS provider selection | Pending | Implementation |
| 5 | WhatsApp channel scope | Deferred | Phase 2+ |
| 6 | Blackboard API access confirmation | Pending | Critical path |

---

*This document is a planning artifact and does not constitute implementation direction.*
