# PRD: Cohort Operations

## Introduction

Enable Operations Coordinators to manage cohorts, schedules, capacity, and handle exceptions like postponements and cancellations.

**Depends on:** `catalog-management`, `zoom-integration`

## Goals

- Primary: Cohort scheduling and capacity management
- Primary: Handle postponements and cancellations
- Secondary: Waitlist management

## User Stories

### US-001: Cohort Schema
**Description:** As a developer, I want cohort schema so that offerings are stored.

**Acceptance Criteria:**
- [ ] Cohort table: id, program_id, start_date, end_date, capacity, enrolled_count, status
- [ ] CohortStatus enum: DRAFT, OPEN, FULL, IN_PROGRESS, COMPLETED, CANCELLED
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-002: Create Cohort
**Description:** As an Operations Coordinator, I want to create cohorts so that learners can enroll.

**Acceptance Criteria:**
- [ ] Form with: program, start date, end date, capacity
- [ ] Generates schedule from program curriculum
- [ ] Status starts as DRAFT
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/cohorts/new

---

### US-003: Schedule Sessions
**Description:** As an Operations Coordinator, I want to schedule sessions so that learners know when to attend.

**Acceptance Criteria:**
- [ ] Add sessions with date, time, duration
- [ ] Assign instructor per session
- [ ] Auto-creates Zoom meeting
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/cohorts/[id]/sessions

---

### US-004: Open Cohort for Registration
**Description:** As an Operations Coordinator, I want to open cohorts so that learners can register.

**Acceptance Criteria:**
- [ ] "Open" button changes status
- [ ] Appears in public catalog
- [ ] Validation: must have sessions scheduled
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/cohorts

---

### US-005: View Capacity Dashboard
**Description:** As an Operations Coordinator, I want to see capacity so that I can manage demand.

**Acceptance Criteria:**
- [ ] List of cohorts with capacity bars
- [ ] Shows: enrolled / capacity
- [ ] Color coding: green/yellow/red
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/dashboard

---

### US-006: Request Postponement
**Description:** As an Operations Coordinator, I want to request postponement so that dates can change.

**Acceptance Criteria:**
- [ ] Form with new dates, reason
- [ ] Creates approval request
- [ ] Shows affected learner count
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/cohorts/[id]/postpone

---

### US-007: Execute Postponement
**Description:** As a system, I want to execute approved postponements so that dates update.

**Acceptance Criteria:**
- [ ] Update cohort dates
- [ ] Reschedule all sessions
- [ ] Update Zoom meetings
- [ ] Notify all learners
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-008: Request Cancellation
**Description:** As an Operations Coordinator, I want to request cancellation so that programs are stopped.

**Acceptance Criteria:**
- [ ] Form with reason
- [ ] Creates approval request
- [ ] Shows affected learner count and refund amount
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/cohorts/[id]/cancel

---

### US-009: Execute Cancellation
**Description:** As a system, I want to execute approved cancellations so that everything is cleaned up.

**Acceptance Criteria:**
- [ ] Set cohort status to CANCELLED
- [ ] Cancel all registrations
- [ ] Create refund requests for all
- [ ] Return B2B seats
- [ ] Delete Zoom meetings
- [ ] Notify all learners
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-010: Force Enrollment
**Description:** As an Operations Coordinator, I want to force-enroll so that exceptions are handled.

**Acceptance Criteria:**
- [ ] Enroll learner without payment
- [ ] Mark as "Comp" or "Exception"
- [ ] Requires approval
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/cohorts/[id]/enroll

---

### US-011: Manage Waitlist
**Description:** As an Operations Coordinator, I want to see waitlist so that I can manage demand.

**Acceptance Criteria:**
- [ ] View waitlist entries
- [ ] Manual promote option
- [ ] Remove from waitlist
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/cohorts/[id]/waitlist

---

## Functional Requirements

1. Cohort lifecycle management
2. Session scheduling with Zoom
3. Capacity tracking
4. Postponement workflow
5. Cancellation workflow

## Non-Goals

- Automated scheduling optimization
- Instructor availability calendar
- Venue management (physical)

## Design Considerations

- Dashboard-focused for operations
- Clear status indicators
- Bulk actions support

## Technical Considerations

- Transactional updates for cancellation
- Zoom API calls for rescheduling
- Email queuing for bulk notifications

## Success Metrics

- Cohort creation time < 5 minutes
- Cancellation processing < 1 minute
- Zero orphaned Zoom meetings

## Open Questions

- Minimum notice for postponement?
- Auto-cancel if below minimum enrollment?
