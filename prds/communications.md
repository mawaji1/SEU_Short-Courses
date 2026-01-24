# PRD: Communications

## Introduction

Deliver timely notifications to learners, instructors, and staff via email and in-platform messaging.

**Depends on:** `user-auth`, `registration-b2c`, `certificates`

## Goals

- Primary: Automated transactional emails
- Secondary: In-platform notifications
- Secondary: Bulk communications

## User Stories

### US-001: Email Configuration
**Description:** As a developer, I want email config so that sending works.

**Acceptance Criteria:**
- [ ] SMTP or API provider config (SendGrid, Postmark, etc.)
- [ ] From address configured
- [ ] Environment-specific settings
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-002: Email Template Schema
**Description:** As a developer, I want template schema so that emails are customizable.

**Acceptance Criteria:**
- [ ] EmailTemplate table: id, key, subject_ar, subject_en, body_ar, body_en
- [ ] Supports variables: {{name}}, {{program}}, etc.
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-003: Registration Confirmation Email
**Description:** As a system, I want to send confirmation emails so that learners know they're enrolled.

**Acceptance Criteria:**
- [ ] Triggered on payment success
- [ ] Contains: program name, dates, receipt
- [ ] Calendar invite attachment
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-004: Payment Receipt Email
**Description:** As a system, I want to send receipts so that learners have records.

**Acceptance Criteria:**
- [ ] Triggered on payment success
- [ ] Contains: amount, method, receipt number
- [ ] PDF attachment option
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-005: Pre-Course Reminder
**Description:** As a system, I want to send reminders so that learners don't forget.

**Acceptance Criteria:**
- [ ] Sent N days before course start
- [ ] Contains: start date, time, join instructions
- [ ] Configurable timing
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-006: Session Reminder
**Description:** As a system, I want to send session reminders so that attendance is high.

**Acceptance Criteria:**
- [ ] Sent 1 hour before session
- [ ] Contains: session time, join link
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-007: Completion Email
**Description:** As a system, I want to notify completion so that learners celebrate.

**Acceptance Criteria:**
- [ ] Sent when course ends
- [ ] Contains: congratulations, certificate link
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-008: Certificate Ready Email
**Description:** As a system, I want to notify certificate so that learners download it.

**Acceptance Criteria:**
- [ ] Sent when certificate issued
- [ ] Contains: download link, verification code
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-009: Notification Schema
**Description:** As a developer, I want notification schema for in-app notifications.

**Acceptance Criteria:**
- [ ] Notification table: id, user_id, type, title, message, read, created_at
- [ ] NotificationType enum: INFO, SUCCESS, WARNING, ACTION
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-010: In-App Notification Bell
**Description:** As a user, I want notification bell so that I see updates.

**Acceptance Criteria:**
- [ ] Bell icon in header
- [ ] Unread count badge
- [ ] Dropdown with recent notifications
- [ ] Mark as read
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000 (logged in)

---

### US-011: Bulk Email Send
**Description:** As an Operations Coordinator, I want to send bulk emails so that I can communicate.

**Acceptance Criteria:**
- [ ] Compose form with subject/body
- [ ] Select cohort or custom recipients
- [ ] Preview before send
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/admin/communications

---

### US-012: Email Queue Processing
**Description:** As a system, I want email queue so that sending is reliable.

**Acceptance Criteria:**
- [ ] Queue emails for async processing
- [ ] Retry failed sends
- [ ] Track delivery status
- [ ] Typecheck passes
- [ ] Lint passes

---

## Functional Requirements

1. Transactional emails for key events
2. Scheduled reminders
3. In-app notifications
4. Bulk communication tools
5. Email queue for reliability

## Non-Goals

- SMS integration (Phase 2)
- WhatsApp integration (Phase 2+)
- Push notifications (mobile app)

## Design Considerations

- Arabic-first email templates
- Mobile-friendly email design
- Clear notification categories

## Technical Considerations

- Email queue with retry
- Template rendering engine
- Unsubscribe handling

## Success Metrics

- Email delivery rate > 98%
- Open rate > 40%
- Notification seen rate > 80%

## Open Questions

- Email frequency limits?
- Notification retention period?
