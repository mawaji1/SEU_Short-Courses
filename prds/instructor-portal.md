# PRD: Instructor Portal

## Introduction

Enable instructors to manage their courses, deliver sessions via Zoom, upload materials, track attendance, and communicate with learners.

**Depends on:** `user-auth`, `zoom-integration`, `catalog-management`

## Goals

- Primary: Instructor self-service for session management
- Primary: Materials upload and sharing
- Secondary: Attendance tracking and messaging

## User Stories

### US-001: Instructor Dashboard
**Description:** As an instructor, I want a dashboard so that I see my teaching overview.

**Acceptance Criteria:**
- [ ] List of assigned courses
- [ ] Upcoming sessions with dates
- [ ] Quick stats: total learners, sessions this week
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/instructor

---

### US-002: View Assigned Courses
**Description:** As an instructor, I want to see my courses so that I know what I'm teaching.

**Acceptance Criteria:**
- [ ] List of programs assigned to instructor
- [ ] Shows cohort dates, learner count
- [ ] Link to course detail
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/instructor/courses

---

### US-003: View Upcoming Sessions
**Description:** As an instructor, I want to see upcoming sessions so that I can prepare.

**Acceptance Criteria:**
- [ ] Calendar or list view of sessions
- [ ] Shows date, time, cohort name
- [ ] Start Session button when available
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/instructor/sessions

---

### US-004: View Enrolled Learners
**Description:** As an instructor, I want to see enrolled learners so that I know my audience.

**Acceptance Criteria:**
- [ ] List of learners in cohort
- [ ] Shows name, email, enrollment date
- [ ] Attendance status indicator
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/instructor/courses/[id]/learners

---

### US-005: Upload Course Materials
**Description:** As an instructor, I want to upload materials so that learners can access them.

**Acceptance Criteria:**
- [ ] Upload button for files (PDF, PPTX, DOC)
- [ ] Add external links
- [ ] Title and description for each
- [ ] Max file size: 50MB
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/instructor/courses/[id]/materials

---

### US-006: Materials Schema
**Description:** As a developer, I want materials schema for file storage.

**Acceptance Criteria:**
- [ ] CourseMaterial table: id, cohort_id, title, type, file_url, external_url, created_at
- [ ] MaterialType enum: FILE, LINK
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-007: Delete/Update Materials
**Description:** As an instructor, I want to manage materials so that content is current.

**Acceptance Criteria:**
- [ ] Edit title/description
- [ ] Delete with confirmation
- [ ] Reorder materials
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/instructor/courses/[id]/materials

---

### US-008: View Session Attendance
**Description:** As an instructor, I want to see attendance so that I know who attended.

**Acceptance Criteria:**
- [ ] List of learners with attendance status
- [ ] Shows join time, duration
- [ ] Overall attendance percentage
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/instructor/sessions/[id]/attendance

---

### US-009: Manual Attendance Override
**Description:** As an instructor, I want to mark attendance manually so that I can correct errors.

**Acceptance Criteria:**
- [ ] Toggle present/absent per learner
- [ ] Reason field for override
- [ ] Saves with audit trail
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/instructor/sessions/[id]/attendance

---

### US-010: Send Message to Learners
**Description:** As an instructor, I want to message learners so that I can communicate.

**Acceptance Criteria:**
- [ ] Message composer
- [ ] Send to all or selected learners
- [ ] Visible in learner's course page
- [ ] Email notification option
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/instructor/courses/[id]/messages

---

### US-011: Message Schema
**Description:** As a developer, I want message schema for communication.

**Acceptance Criteria:**
- [ ] CourseMessage table: id, cohort_id, sender_id, subject, body, created_at
- [ ] MessageRecipient junction table
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-012: Request Certificate Override
**Description:** As an instructor, I want to request certificate override so that deserving learners get certified.

**Acceptance Criteria:**
- [ ] Override request button on learner
- [ ] Reason/justification field
- [ ] Creates approval request
- [ ] Shows pending status
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/instructor/courses/[id]/learners

---

## Functional Requirements

1. Course and session overview
2. Materials upload and management
3. Attendance viewing and override
4. Learner messaging
5. Certificate override requests

## Non-Goals

- Grading assignments
- Quiz creation
- Video upload/streaming

## Design Considerations

- Clean, professional dashboard
- Quick access to upcoming sessions
- Mobile-friendly for on-the-go

## Technical Considerations

- File upload to object storage
- Real-time message delivery (optional)
- Audit logging for overrides

## Success Metrics

- Session start within 2 clicks
- Materials upload < 30 seconds
- Message delivery < 5 seconds

## Open Questions

- Max materials per course?
- Message character limit?
