# PRD: Approval Workflows

## Introduction

Implement multi-level approval workflows for risky operations to ensure governance and accountability.

**Depends on:** `user-auth`, `registration-b2c`, `payments`, `certificates`, `cohort-operations`

## Goals

- Primary: Approval workflows for high-risk actions
- Primary: Audit trail for all decisions
- Secondary: Escalation rules

## User Stories

### US-001: Approval Request Schema
**Description:** As a developer, I want approval schema so that requests are tracked.

**Acceptance Criteria:**
- [ ] ApprovalRequest table: id, type, requester_id, data_json, status, created_at
- [ ] ApprovalType enum: REFUND, BULK_ENROLLMENT, CANCELLATION, POSTPONEMENT, CERTIFICATE_OVERRIDE, FORCE_ENROLL
- [ ] ApprovalStatus enum: PENDING, APPROVED, REJECTED
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-002: Approval Decision Schema
**Description:** As a developer, I want decision schema for audit trail.

**Acceptance Criteria:**
- [ ] ApprovalDecision table: id, request_id, approver_id, decision, comments, decided_at
- [ ] DecisionType enum: APPROVED, REJECTED
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-003: Approver Mapping
**Description:** As a developer, I want approver config so that right people are notified.

**Acceptance Criteria:**
- [ ] ApprovalType to Role mapping
- [ ] Multiple approvers per type (any can approve)
- [ ] Configurable in system settings
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-004: Create Approval Request
**Description:** As a system, I want to create requests so that actions are queued.

**Acceptance Criteria:**
- [ ] Service to create request
- [ ] Stores relevant data in JSON
- [ ] Determines approvers
- [ ] Sends notification
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-005: Pending Approvals Dashboard
**Description:** As an approver, I want to see pending items so that I can act.

**Acceptance Criteria:**
- [ ] List of pending requests for my role
- [ ] Shows: type, requester, date, summary
- [ ] Sorted by oldest first
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/approvals

---

### US-006: Approval Detail View
**Description:** As an approver, I want to see details so that I can decide.

**Acceptance Criteria:**
- [ ] Full request details
- [ ] Related data (learner, amount, reason)
- [ ] Approve/Reject buttons
- [ ] Comments field
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/approvals/[id]

---

### US-007: Approve Request
**Description:** As an approver, I want to approve so that action executes.

**Acceptance Criteria:**
- [ ] Click approve button
- [ ] Optional comment
- [ ] Status updated to APPROVED
- [ ] Triggers execution
- [ ] Notifies requester
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/approvals/[id]

---

### US-008: Reject Request
**Description:** As an approver, I want to reject so that action is stopped.

**Acceptance Criteria:**
- [ ] Click reject button
- [ ] Required comment for rejection
- [ ] Status updated to REJECTED
- [ ] Notifies requester with reason
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/approvals/[id]

---

### US-009: Approval Email Notification
**Description:** As an approver, I want email notification so that I act quickly.

**Acceptance Criteria:**
- [ ] Email sent when assigned request
- [ ] Contains: type, requester, summary, link
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-010: Requester Notification
**Description:** As a requester, I want notification so that I know the outcome.

**Acceptance Criteria:**
- [ ] Email on approval/rejection
- [ ] In-app notification
- [ ] Includes decision and comments
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-011: My Requests View
**Description:** As a requester, I want to see my requests so that I track status.

**Acceptance Criteria:**
- [ ] List of my submitted requests
- [ ] Status indicator
- [ ] Decision details when complete
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/my-requests

---

### US-012: Escalation Rule
**Description:** As a system, I want to escalate so that stale requests get attention.

**Acceptance Criteria:**
- [ ] Configurable escalation time (e.g., 24 hours)
- [ ] Escalate to next level or send reminder
- [ ] Log escalation event
- [ ] Typecheck passes
- [ ] Lint passes

---

## Functional Requirements

1. Approval request creation and tracking
2. Pending approvals dashboard
3. Approve/reject with comments
4. Email and in-app notifications
5. Audit trail for all decisions

## Non-Goals

- Complex multi-step approval chains
- Delegation to substitutes (Phase 2)
- Mobile app notifications

## Design Considerations

- Clear status indicators
- Quick approve/reject actions
- Full context in detail view

## Technical Considerations

- Generic approval system (polymorphic)
- Cron job for escalation
- Event-driven execution

## Success Metrics

- Approval response time < 24 hours
- Escalation rate < 10%
- 100% audit trail coverage

## Open Questions

- Escalation hierarchy?
- Auto-approve for small refunds?
