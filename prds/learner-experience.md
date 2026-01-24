# PRD: Learner Experience

## Introduction

Enable learners to access their enrolled courses, join sessions, download materials, view progress, and receive certificates.

**Depends on:** `user-auth`, `registration-b2c`, `zoom-integration`, `instructor-portal`

## Goals

- Primary: Seamless course access and session joining
- Primary: Progress and completion tracking
- Secondary: Materials access and certificate download

## User Stories

### US-001: My Courses Page
**Description:** As a learner, I want to see my enrolled courses so that I can access learning.

**Acceptance Criteria:**
- [ ] List of confirmed enrollments
- [ ] Shows program name, dates, progress
- [ ] Active courses highlighted
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/my-courses

---

### US-002: Course Detail Page
**Description:** As a learner, I want to see course details so that I know what to expect.

**Acceptance Criteria:**
- [ ] Program description and outcomes
- [ ] Curriculum/modules list
- [ ] Instructor profile
- [ ] Session schedule
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/my-courses/[id]

---

### US-003: Upcoming Sessions List
**Description:** As a learner, I want to see upcoming sessions so that I can plan.

**Acceptance Criteria:**
- [ ] List of upcoming sessions with dates/times
- [ ] Countdown to next session
- [ ] Join button when session live
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/my-courses/[id]

---

### US-004: Join Session Button
**Description:** As a learner, I want to join a session so that I can attend class.

**Acceptance Criteria:**
- [ ] "Join Session" button visible
- [ ] Only enabled when session IN_PROGRESS
- [ ] Opens embedded Zoom
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/my-courses/[id]

---

### US-005: Download Materials
**Description:** As a learner, I want to download materials so that I can study.

**Acceptance Criteria:**
- [ ] List of available materials
- [ ] Download button for files
- [ ] Open in new tab for links
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/my-courses/[id]/materials

---

### US-006: View Progress
**Description:** As a learner, I want to see my progress so that I know my standing.

**Acceptance Criteria:**
- [ ] Attendance percentage displayed
- [ ] Sessions attended vs total
- [ ] Certificate eligibility indicator
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/my-courses/[id]

---

### US-007: View Attendance History
**Description:** As a learner, I want to see my attendance so that I can verify records.

**Acceptance Criteria:**
- [ ] List of sessions with attendance status
- [ ] Duration attended per session
- [ ] Overall percentage
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/my-courses/[id]/attendance

---

### US-008: View Messages from Instructor
**Description:** As a learner, I want to see instructor messages so that I stay informed.

**Acceptance Criteria:**
- [ ] Messages section on course page
- [ ] Chronological order
- [ ] Mark as read functionality
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/my-courses/[id]/messages

---

### US-009: Completion Status
**Description:** As a learner, I want to see completion status so that I know when I'm done.

**Acceptance Criteria:**
- [ ] Status: In Progress, Completed, Incomplete
- [ ] Completed shows certificate link
- [ ] Incomplete shows reason (attendance)
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/my-courses/[id]

---

### US-010: Download Certificate
**Description:** As a learner, I want to download my certificate so that I have proof.

**Acceptance Criteria:**
- [ ] Download button when eligible
- [ ] Opens PDF certificate
- [ ] Shows verification code
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/my-courses/[id]

---

## Functional Requirements

1. Course dashboard with progress
2. Session joining via Zoom
3. Materials access
4. Attendance history
5. Certificate download

## Non-Goals

- Course discussion forums
- Peer interaction
- Assignment submission

## Design Considerations

- Clean, focused learning interface
- Prominent join button
- Mobile-optimized

## Technical Considerations

- Lazy loading for materials
- Progress caching
- Certificate PDF caching

## Success Metrics

- Session join time < 5 seconds
- Materials download < 3 seconds
- Certificate access immediately on completion

## Open Questions

- Show past sessions recordings?
- Feedback collection after completion?
