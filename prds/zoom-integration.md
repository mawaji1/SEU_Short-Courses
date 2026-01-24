# PRD: Zoom Integration

## Introduction

Enable live virtual training sessions by integrating Zoom Meeting SDK and API. This allows instructors to deliver sessions and learners to attend directly within the platform, with automatic attendance tracking.

## Goals

- Primary: Deliver live training via embedded Zoom meetings
- Primary: Track attendance automatically via webhooks
- Secondary: Manage Zoom licenses programmatically

## User Stories

### US-001: Zoom Configuration Schema
**Description:** As a developer, I want to store Zoom config so that integration settings are persistent.

**Acceptance Criteria:**
- [ ] Environment variables for ZOOM_ACCOUNT_ID, CLIENT_ID, CLIENT_SECRET
- [ ] Environment variables for ZOOM_SDK_KEY, ZOOM_SDK_SECRET
- [ ] Validation on startup
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-002: Server-to-Server OAuth Token
**Description:** As a developer, I want to obtain Zoom API tokens so that backend can call Zoom APIs.

**Acceptance Criteria:**
- [ ] Token fetch service with auto-refresh
- [ ] Token cached until near expiry
- [ ] Error handling for auth failures
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-003: Session Database Schema
**Description:** As a developer, I want session schema so that Zoom meeting data is stored.

**Acceptance Criteria:**
- [ ] Session table: id, cohort_id, instructor_id, zoom_meeting_id, zoom_join_url, zoom_start_url, start_time, duration, status
- [ ] SessionAttendance table: session_id, user_id, join_time, leave_time, duration
- [ ] SessionStatus enum: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-004: Create Zoom User for Instructor
**Description:** As a system, I want to provision Zoom users so that instructors can host meetings.

**Acceptance Criteria:**
- [ ] Create Zoom user via API when instructor assigned
- [ ] Store zoom_user_id on User record
- [ ] Handle existing user case
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-005: Assign Zoom License
**Description:** As a system, I want to assign Pro licenses so that instructors can host long meetings.

**Acceptance Criteria:**
- [ ] Assign license via API
- [ ] Track license assignment date
- [ ] Handle license limit errors
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-006: Create Zoom Meeting for Session
**Description:** As a system, I want to create Zoom meetings so that sessions have join links.

**Acceptance Criteria:**
- [ ] Create meeting under instructor's Zoom user ID
- [ ] Set topic, start time, duration
- [ ] Store meeting ID, join URL, start URL
- [ ] Enable waiting room
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-007: Session Scheduling API
**Description:** As an Operations Coordinator, I want an API to schedule sessions so that Zoom meetings are created.

**Acceptance Criteria:**
- [ ] POST /api/sessions endpoint
- [ ] Input: cohort_id, instructor_id, start_time, duration
- [ ] Creates session record and Zoom meeting
- [ ] Returns session with join URLs
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-008: Generate Meeting SDK Signature
**Description:** As a developer, I want to generate SDK signatures so that frontend can join meetings.

**Acceptance Criteria:**
- [ ] Signature generation endpoint
- [ ] Input: meeting number, role (0=participant, 1=host)
- [ ] Returns signature with expiry
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-009: Instructor Start Session Button
**Description:** As an instructor, I want a "Start Session" button so that I can begin teaching.

**Acceptance Criteria:**
- [ ] Button visible on instructor dashboard for scheduled sessions
- [ ] Only enabled within 15 minutes of start time
- [ ] Clicking opens embedded Zoom
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/instructor/sessions

---

### US-010: Embedded Zoom Meeting Component
**Description:** As a developer, I want an embedded Zoom component so that users don't leave the platform.

**Acceptance Criteria:**
- [ ] ZoomMeetingEmbed React component
- [ ] Uses Zoom Meeting SDK (embedded)
- [ ] Supports Arabic language
- [ ] Full-screen toggle
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/session/[id]/join

---

### US-011: Learner Join Session Button
**Description:** As a learner, I want a "Join Session" button so that I can attend class.

**Acceptance Criteria:**
- [ ] Button visible in "My Courses" for upcoming sessions
- [ ] Only enabled when session is IN_PROGRESS
- [ ] Clicking opens embedded Zoom
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/my-courses

---

### US-012: Webhook Endpoint Setup
**Description:** As a developer, I want a webhook endpoint so that Zoom events are received.

**Acceptance Criteria:**
- [ ] POST /api/webhooks/zoom endpoint
- [ ] Webhook verification challenge handled
- [ ] Signature validation
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-013: Handle Meeting Started Event
**Description:** As a system, I want to process meeting.started so that session status updates.

**Acceptance Criteria:**
- [ ] Update session status to IN_PROGRESS
- [ ] Log event
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-014: Handle Meeting Ended Event
**Description:** As a system, I want to process meeting.ended so that session completes.

**Acceptance Criteria:**
- [ ] Update session status to COMPLETED
- [ ] Calculate total attendance durations
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-015: Handle Participant Joined Event
**Description:** As a system, I want to track when participants join so that attendance starts.

**Acceptance Criteria:**
- [ ] Create SessionAttendance record
- [ ] Record join_time
- [ ] Match participant to user by email
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-016: Handle Participant Left Event
**Description:** As a system, I want to track when participants leave so that attendance duration is calculated.

**Acceptance Criteria:**
- [ ] Update SessionAttendance with leave_time
- [ ] Calculate duration
- [ ] Handle multiple join/leave cycles
- [ ] Typecheck passes
- [ ] Lint passes

---

### US-017: Session Attendance Report
**Description:** As an instructor, I want to view attendance for a session so that I know who attended.

**Acceptance Criteria:**
- [ ] List of attendees with join time and duration
- [ ] Total attendance percentage calculated
- [ ] Export to CSV option
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/instructor/sessions/[id]/attendance

---

### US-018: Manual Attendance Override
**Description:** As an instructor, I want to manually mark attendance so that I can correct errors.

**Acceptance Criteria:**
- [ ] Toggle to mark learner as present/absent
- [ ] Override stored with timestamp
- [ ] Audit log entry created
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Verify at localhost:3000/instructor/sessions/[id]/attendance

---

## Functional Requirements

1. Zoom Meeting SDK for embedded meetings
2. Zoom REST API for meeting management
3. Automatic attendance via webhooks
4. Manual attendance override capability
5. License management

## Non-Goals

- Recording transcription
- Breakout rooms management
- Virtual backgrounds

## Design Considerations

- Embedded meeting fills available space
- Clear join/start buttons
- Arabic UI within Zoom component

## Technical Considerations

- Server-to-Server OAuth (not JWT app)
- Webhook retry handling
- Rate limiting consideration
- SDK version management

## Success Metrics

- Meeting creation success rate > 99%
- Attendance tracking accuracy > 95%
- Session join time < 5 seconds

## Open Questions

- Recording storage location?
- Maximum meeting duration?
</Parameter>
<parameter name="Complexity">7
