# Blackboard Completion Sync - Integration Guide

## Overview

Epic E1.9 implements automatic synchronization of course completion status from Blackboard Learn. The system tracks learner progress, syncs completion data, and triggers certificate generation when learners complete courses.

---

## Architecture

### Components

1. **BlackboardCompletionService** - Completion sync orchestrator with cron jobs
2. **BlackboardApiClient** - Extended with progress/completion endpoints
3. **BlackboardController** - Admin endpoints for completion management
4. **Admin UI** - Completion monitoring dashboard

### Completion Flow

```
Blackboard Course Activity → Daily Sync (2 AM) → Update Progress → Trigger Certificate
                          ↓
                    Webhook (Real-time) → Immediate Sync → Send Notification
```

---

## Features

### ✅ Implemented

- **Automatic Daily Sync** - Cron job runs at 2 AM daily
- **Webhook Support** - Real-time completion events from Blackboard
- **Progress Tracking** - Track completion percentage (0-100%)
- **Completion Threshold** - 80% threshold for course completion
- **Certificate Eligibility** - Auto-flag for certificate generation
- **Completion Notifications** - Email notifications on completion
- **Admin Monitoring Dashboard** - Real-time completion statistics
- **Bulk Sync** - Sync multiple enrollments at once
- **Cohort Statistics** - Completion stats per cohort
- **Program Statistics** - Completion stats per program
- **Admin Alerts** - Email alerts on sync failures

### Completion States

```typescript
completionStatus:
  - NOT_STARTED  // No activity yet
  - IN_PROGRESS  // Active learning
  - COMPLETED    // >= 80% completion
  - FAILED       // Failed the course
```

---

## Database Schema

### Enrollment Model Updates

```prisma
model Enrollment {
  // ... existing fields
  
  progress               Int              @default(0) // 0-100 percentage
  completionStatus       String?          // NOT_STARTED, IN_PROGRESS, COMPLETED, FAILED
  completionPercentage   Int?             // From Blackboard
  lastActivityAt         DateTime?        // Last activity in Blackboard
  completedAt            DateTime?
  certificateEligible    Boolean          @default(false)
}
```

### Migration Required

```bash
cd backend
npx prisma migrate dev --name add_completion_tracking
```

---

## API Endpoints

### Sync Single Enrollment
```http
POST /api/blackboard/completion/sync/:enrollmentId
Authorization: Bearer {jwt_token}
Roles: ADMIN, OPERATIONS

Response:
{
  "success": true,
  "message": "Completion status synced"
}
```

### Bulk Sync Enrollments
```http
POST /api/blackboard/completion/sync/bulk
Authorization: Bearer {jwt_token}
Roles: ADMIN
Content-Type: application/json

Body:
{
  "enrollmentIds": ["enroll1", "enroll2", "enroll3"]
}

Response:
{
  "successful": 2,
  "failed": 1,
  "total": 3,
  "errors": ["enroll3: User not provisioned"]
}
```

### Get Cohort Completion Stats
```http
GET /api/blackboard/completion/stats/cohort/:cohortId
Authorization: Bearer {jwt_token}
Roles: ADMIN, OPERATIONS

Response:
{
  "total": 50,
  "completed": 35,
  "inProgress": 12,
  "notStarted": 3,
  "averageProgress": 78,
  "completionRate": 70
}
```

### Get Program Completion Stats
```http
GET /api/blackboard/completion/stats/program/:programId
Authorization: Bearer {jwt_token}
Roles: ADMIN, OPERATIONS

Response:
{
  "total": 150,
  "completed": 98,
  "completionRate": 65,
  "averageProgress": 72
}
```

### Webhook Endpoint (Blackboard → Platform)
```http
POST /api/blackboard/webhooks/completion
Content-Type: application/json

Body:
{
  "userId": "bb_user_123",
  "courseId": "bb_course_456",
  "completionPercentage": 85,
  "timestamp": "2026-01-12T00:00:00Z"
}

Response:
{
  "success": true,
  "message": "Webhook processed"
}
```

---

## Admin Dashboard

### Completion Monitoring Page

**URL:** `/admin/completion-monitoring`

**Features:**
1. **Overall Statistics**
   - Total enrollments across all cohorts
   - Total completed
   - Total in progress
   - Overall completion rate

2. **Cohort-Level View**
   - Table showing all cohorts
   - Completion stats per cohort
   - Progress bars for average progress
   - Color-coded completion rates

3. **Manual Sync**
   - Sync button for each cohort
   - Bulk sync all enrollments in cohort
   - Real-time progress updates

4. **Visual Indicators**
   - Green: >= 80% completion rate
   - Yellow: 50-79% completion rate
   - Red: < 50% completion rate

---

## Automated Sync

### Daily Cron Job

**Schedule:** Every day at 2:00 AM

**What it does:**
1. Finds all active enrollments (ENROLLED, IN_PROGRESS)
2. Syncs completion status from Blackboard
3. Updates progress and completion percentage
4. Triggers certificate generation for newly completed
5. Sends admin alert if failures occur

**Configuration:**
```typescript
@Cron(CronExpression.EVERY_DAY_AT_2AM)
async syncAllActiveEnrollments(): Promise<void> {
  // Automatic daily sync
}
```

---

## Webhook Integration

### Setup Blackboard Webhook

1. **Access Blackboard Admin Panel**
2. **Navigate to:** System Admin → Integrations → Webhooks
3. **Create New Webhook:**
   - Event: Course Completion
   - URL: `https://your-domain.com/api/blackboard/webhooks/completion`
   - Method: POST
   - Authentication: Bearer token or signature

4. **Test Webhook:**
   - Complete a test course in Blackboard
   - Verify webhook received in logs
   - Check enrollment updated in database

---

## Completion Criteria

### Threshold Configuration

**Default:** 80% completion = course complete

**Can be configured per program:**
```typescript
const completionThreshold = 80; // In BlackboardCompletionService
```

### What Counts as Complete?

- Completion percentage >= 80%
- All required assignments submitted
- Final grade calculated
- Activity within last 30 days (optional)

---

## Certificate Generation Trigger

### Automatic Trigger

When a user completes a course (>= 80%):

1. **Update Enrollment:**
   - `status` → COMPLETED
   - `completedAt` → current timestamp
   - `certificateEligible` → true

2. **Send Notification:**
   - Email to user: "Congratulations! Course Completed"
   - Include completion date and next steps

3. **Trigger Certificate (Future - Epic E1.10):**
   ```typescript
   // await certificateService.generateCertificate(enrollment.id);
   ```

---

## Usage Examples

### Manual Sync Single Enrollment

```typescript
// Sync completion for one enrollment
await completionService.syncEnrollmentCompletion('enrollment_123');
```

### Bulk Sync Cohort

```typescript
// Get all enrollments for cohort
const enrollments = await prisma.enrollment.findMany({
  where: { cohortId: 'cohort_123' },
});

const enrollmentIds = enrollments.map(e => e.id);

// Bulk sync
const result = await completionService.bulkSyncCompletion(enrollmentIds);
console.log(`${result.successful} synced, ${result.failed} failed`);
```

### Get Statistics

```typescript
// Cohort stats
const cohortStats = await completionService.getCohortCompletionStats('cohort_123');
console.log(`Completion rate: ${cohortStats.completionRate}%`);

// Program stats
const programStats = await completionService.getProgramCompletionStats('program_456');
console.log(`Average progress: ${programStats.averageProgress}%`);
```

---

## Error Handling

### Retry Logic

- **No automatic retries** for completion sync (data is read-only)
- Failed syncs logged and reported in admin alerts
- Manual retry available via admin dashboard

### Common Errors

1. **User Not Provisioned**
   - Error: "User not provisioned to Blackboard"
   - Solution: Run user provisioning first

2. **Course Not Mapped**
   - Error: "Cohort not mapped to Blackboard course"
   - Solution: Map cohort to Blackboard course

3. **API Rate Limiting**
   - Automatic delay between bulk sync requests (500ms)
   - Adjust delay if rate limits encountered

### Admin Alerts

Daily sync failures trigger admin email:

```
Subject: [ADMIN ALERT] Completion Sync Failures

Daily completion sync completed with 5 failures.

Errors:
- enrollment_123: User not provisioned
- enrollment_456: Course not found
- enrollment_789: API timeout
```

---

## Monitoring

### Key Metrics

- Daily sync success rate
- Average sync time
- Completion rate trends
- Certificate eligibility count
- Webhook processing time

### Logs

```typescript
// Success
[BlackboardCompletionService] User user@example.com completed course: Introduction to AI

// Daily sync
[BlackboardCompletionService] Daily completion sync complete: 45 successful, 2 failed

// Webhook
[BlackboardCompletionService] Processed completion webhook for user bb_user_123
```

---

## Blackboard API Reference

### Required Endpoints

1. **Get User Grade**
   - `GET /learn/api/public/v1/courses/{courseId}/gradebook/users/{userId}`
   - Returns: `{ score: 85 }`

2. **Get User Activity**
   - `GET /learn/api/public/v1/courses/{courseId}/users/{userId}/activity`
   - Returns: `{ lastAccessed: "2026-01-12T00:00:00Z" }`

### Completion Calculation

```typescript
completionPercentage = gradeResponse.score || 0;
isComplete = completionPercentage >= 80;
```

---

## Testing Checklist

### Unit Tests
- [ ] Completion sync logic
- [ ] Threshold validation
- [ ] Certificate eligibility logic
- [ ] Statistics calculation

### Integration Tests
- [ ] Blackboard API connectivity
- [ ] Webhook processing
- [ ] Daily cron job
- [ ] Bulk sync
- [ ] Admin dashboard

### Manual Testing
1. Complete a course in Blackboard sandbox
2. Trigger manual sync from admin dashboard
3. Verify completion status updated
4. Verify notification sent
5. Check certificate eligibility flag
6. Test webhook endpoint
7. Verify daily cron job runs

---

## Security Considerations

1. **RBAC** - Only ADMIN and OPERATIONS can sync
2. **Webhook Security** - Validate Blackboard signature
3. **Rate Limiting** - Delay between bulk requests
4. **Audit Trail** - All sync attempts logged
5. **Data Privacy** - Completion data encrypted at rest

---

## Next Steps (Epic E1.10)

After completion sync:

1. **Certificate Generation** - Auto-generate certificates
2. **Certificate Templates** - Customizable certificate designs
3. **Certificate Delivery** - Email certificates to learners

---

## Support

### Blackboard Documentation
- Gradebook API: https://docs.blackboard.com/learn/REST/gradebook
- Webhooks: https://docs.blackboard.com/learn/REST/webhooks

### Internal Contacts
- **Blackboard Admin:** IT Department
- **Webhook Setup:** Operations Team
- **Completion Issues:** Contact ADMIN role users

---

**Status:** ✅ Complete - Full end-to-end implementation (Backend + Frontend + Admin UI)  
**Epic:** E1.9 - Completion Sync  
**Date:** January 12, 2026
