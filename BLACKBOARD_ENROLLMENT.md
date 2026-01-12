# Blackboard Enrollment - Integration Guide

## Overview

Epic E1.8 implements automatic enrollment of provisioned users into Blackboard Learn courses. After a user is provisioned (E1.7) and payment is confirmed, they are automatically enrolled in the corresponding Blackboard course.

---

## Architecture

### Components

1. **BlackboardEnrollmentService** - Enrollment orchestrator with retry logic
2. **BlackboardApiClient** - Extended with enrollment endpoints
3. **BlackboardController** - Admin endpoints for enrollment management

### Enrollment Flow

```
Payment Confirmed → User Provisioned → Enroll in Course → Send Access Email
```

---

## Features

### ✅ Implemented

- **Automatic Enrollment** - Enroll users after payment confirmation
- **Role Assignment** - Assign Student role by default
- **Retry Logic** - Exponential backoff (3 attempts)
- **Enrollment Sync** - Sync enrollment status from Blackboard
- **Withdrawal Support** - Withdraw users from courses
- **Bulk Enrollment** - Enroll multiple users at once
- **Admin Alerts** - Email notifications for enrollment failures
- **Status Tracking** - Database tracking of enrollment state

### Enrollment States

```typescript
blackboardSyncStatus:
  - PENDING  // Enrollment in progress
  - SYNCED   // Successfully enrolled
  - FAILED   // Enrollment failed
```

---

## Database Schema

### Enrollment Model Updates

```prisma
model Enrollment {
  id                     String           @id @default(cuid())
  registrationId         String           @unique
  userId                 String
  cohortId               String
  status                 EnrollmentStatus @default(PENDING)
  
  // Blackboard Integration
  blackboardEnrollmentId String?          @unique
  blackboardCourseId     String?
  blackboardRole         String?          // Student, Instructor, TeachingAssistant
  blackboardSyncStatus   String?          // PENDING, SYNCED, FAILED
  blackboardSyncError    String?
  blackboardSyncedAt     DateTime?
  
  progress               Int              @default(0)
  completedAt            DateTime?
  createdAt              DateTime         @default(now())
  updatedAt              DateTime         @updatedAt
}
```

### Cohort Model Updates

```prisma
model Cohort {
  // ... existing fields
  blackboardCourseId    String?      @unique  // Maps to Blackboard course
}
```

### Migration Required

```bash
cd backend
npx prisma migrate dev --name add_blackboard_enrollment
```

---

## API Endpoints

### Enroll User in Course
```http
POST /api/blackboard/enroll/:enrollmentId
Authorization: Bearer {jwt_token}
Roles: ADMIN, OPERATIONS

Response:
{
  "success": true,
  "blackboardEnrollmentId": "bb_enrollment_123",
  "action": "enrolled",
  "error": null
}
```

### Bulk Enroll Users
```http
POST /api/blackboard/enroll/bulk
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
  "results": [...]
}
```

### Get Enrollment Status
```http
GET /api/blackboard/enroll/status/:enrollmentId
Authorization: Bearer {jwt_token}
Roles: ADMIN, OPERATIONS

Response:
{
  "status": "SYNCED",
  "blackboardEnrollmentId": "bb_enrollment_123",
  "syncedAt": "2026-01-12T00:45:00Z",
  "error": null
}
```

### Withdraw User from Course
```http
POST /api/blackboard/enroll/withdraw/:enrollmentId
Authorization: Bearer {jwt_token}
Roles: ADMIN, OPERATIONS

Response:
{
  "success": true,
  "action": "updated",
  "error": null
}
```

### Sync Enrollment Status
```http
POST /api/blackboard/enroll/sync/:enrollmentId
Authorization: Bearer {jwt_token}
Roles: ADMIN, OPERATIONS

Response:
{
  "success": true,
  "message": "Enrollment status synced"
}
```

---

## Usage Examples

### Automatic Enrollment (Future Integration)

```typescript
// In PaymentService after payment confirmation
async confirmPayment(paymentId: string) {
  // ... payment confirmation logic
  
  // Create enrollment record
  const enrollment = await this.prisma.enrollment.create({
    data: {
      registrationId: registration.id,
      userId: registration.userId,
      cohortId: registration.cohortId,
      status: EnrollmentStatus.PENDING,
    },
  });
  
  // Enroll in Blackboard
  await this.blackboardEnrollmentService.enrollUser(enrollment.id);
}
```

### Manual Enrollment

```typescript
// Enroll single user
const result = await blackboardEnrollmentService.enrollUser('enrollment_123');

if (result.success) {
  console.log(`User enrolled: ${result.blackboardEnrollmentId}`);
} else {
  console.error(`Enrollment failed: ${result.error}`);
}
```

### Bulk Enrollment

```typescript
// Enroll multiple users
const enrollmentIds = ['enroll1', 'enroll2', 'enroll3'];
const result = await blackboardEnrollmentService.bulkEnrollUsers(enrollmentIds);

console.log(`Success: ${result.successful}, Failed: ${result.failed}`);
```

---

## Course Mapping

### How Operations Team Maps Courses

**Operations team uses the admin dashboard UI:**

#### Admin Dashboard (Recommended)

1. **Access Course Mapping Page**
   - Navigate to `/admin/course-mapping`
   - Requires ADMIN or OPERATIONS role

2. **View All Cohorts**
   - See all cohorts with their mapping status
   - Green checkmark = Mapped
   - Yellow alert = Not mapped yet

3. **Map a Cohort**
   - Select cohort from dropdown
   - Enter Blackboard course ID (e.g., `bb_course_12345`)
   - Click "ربط الدورة" (Map Course)
   - Confirmation message appears

4. **Unmap a Cohort (if needed)**
   - Click "إلغاء الربط" (Unmap) next to mapped cohort
   - Confirm the action

5. **View Statistics**
   - Total cohorts
   - Mapped cohorts (green)
   - Unmapped cohorts (yellow)

---

#### API Endpoints (Alternative - for automation/scripts)

**Operations team can also use the admin API directly:**

#### 1. Get All Cohorts and Their Mappings
```http
GET /api/blackboard/courses/mappings
Authorization: Bearer {jwt_token}
Roles: ADMIN, OPERATIONS

Response:
[
  {
    "cohortId": "cohort_123",
    "cohortName": "مقدمة في الذكاء الاصطناعي - دفعة 1",
    "programName": "الذكاء الاصطناعي",
    "blackboardCourseId": "bb_course_456",
    "isMapped": true,
    "startDate": "2026-02-01T00:00:00Z",
    "status": "UPCOMING"
  },
  {
    "cohortId": "cohort_789",
    "cohortName": "علوم البيانات - دفعة 2",
    "programName": "علوم البيانات",
    "blackboardCourseId": null,
    "isMapped": false,
    "startDate": "2026-03-01T00:00:00Z",
    "status": "UPCOMING"
  }
]
```

#### 2. Map Cohort to Blackboard Course
```http
POST /api/blackboard/courses/map
Authorization: Bearer {jwt_token}
Roles: ADMIN, OPERATIONS
Content-Type: application/json

Body:
{
  "cohortId": "cohort_789",
  "blackboardCourseId": "bb_course_999"
}

Response:
{
  "success": true,
  "message": "Cohort mapped to Blackboard course",
  "cohort": {
    "id": "cohort_789",
    "name": "علوم البيانات - دفعة 2",
    "programName": "علوم البيانات",
    "blackboardCourseId": "bb_course_999"
  }
}
```

#### 3. Remove Course Mapping (if needed)
```http
POST /api/blackboard/courses/unmap/:cohortId
Authorization: Bearer {jwt_token}
Roles: ADMIN

Response:
{
  "success": true,
  "message": "Course mapping removed",
  "cohortId": "cohort_789"
}
```

### Finding Blackboard Course IDs

1. Access Blackboard Admin Panel
2. Navigate to Courses
3. Copy the course ID from the URL or course details
4. Use the mapping API to link cohort to course

---

## Error Handling

### Retry Logic

- **Max Retries:** 3 attempts
- **Backoff Strategy:** Exponential (2s, 4s, 8s)
- **Final Failure:** Admin alert sent via email

### Common Errors

1. **User Not Provisioned**
   - Error: "User not provisioned to Blackboard"
   - Solution: Run user provisioning first (E1.7)

2. **Course Not Mapped**
   - Error: "Cohort not mapped to Blackboard course"
   - Solution: Update cohort with `blackboardCourseId`

3. **Already Enrolled**
   - Behavior: Returns success with existing enrollment ID
   - No duplicate enrollments created

### Admin Alerts

When enrollment fails after all retries:

```
Subject: [ADMIN ALERT] Blackboard Enrollment Failed

Failed to enroll user in Blackboard course after 3 attempts.

User: user@example.com
Course: Introduction to AI
Enrollment ID: enrollment_123
Error: Connection timeout
```

---

## Blackboard API Reference

### Required Endpoints

1. **Enroll User**
   - `POST /learn/api/public/v1/courses/{courseId}/users/{userId}`
   - Body: `{ availability: { available: "Yes" }, courseRoleId: "Student" }`

2. **Get Enrollment**
   - `GET /learn/api/public/v1/courses/{courseId}/users/{userId}`

3. **Update Enrollment**
   - `PATCH /learn/api/public/v1/courses/{courseId}/users/{userId}`
   - Body: `{ availability, courseRoleId }`

4. **Delete Enrollment**
   - `DELETE /learn/api/public/v1/courses/{courseId}/users/{userId}`

### Course Roles

- **Student** - Default role for learners
- **Instructor** - For course instructors
- **TeachingAssistant** - For TAs

---

## Testing Checklist

### Unit Tests
- [ ] Enrollment service logic
- [ ] Retry mechanism
- [ ] Error handling
- [ ] Status tracking

### Integration Tests
- [ ] Blackboard API connectivity
- [ ] User enrollment flow
- [ ] Withdrawal flow
- [ ] Bulk enrollment
- [ ] Status sync

### Manual Testing
1. Test with Blackboard sandbox environment
2. Verify user enrollment after payment
3. Test withdrawal functionality
4. Verify admin alerts on failures
5. Test bulk enrollment
6. Verify enrollment status sync

---

## Monitoring

### Key Metrics

- Enrollment success rate
- Average enrollment time
- Retry frequency
- Failed enrollment count
- Enrollment sync latency

### Logs

```typescript
// Success
[BlackboardEnrollmentService] Successfully enrolled user: user@example.com in course: Introduction to AI

// Retry
[BlackboardEnrollmentService] Enrollment attempt 2/3 failed for user: user@example.com

// Failure
[BlackboardEnrollmentService] Enrollment failed for user: user@example.com
```

---

## Integration with Payment Flow

### Recommended Flow

```typescript
// 1. Payment confirmed
// 2. Create enrollment record
const enrollment = await prisma.enrollment.create({...});

// 3. Provision user (if not already provisioned)
if (!user.blackboardUserId) {
  await blackboardProvisioningService.provisionUser(user.id);
}

// 4. Enroll in course
await blackboardEnrollmentService.enrollUser(enrollment.id);

// 5. Send access email
await notificationService.sendBlackboardAccess(user.id, user.email, {...});
```

---

## Security Considerations

1. **RBAC** - Only ADMIN and OPERATIONS roles can enroll
2. **Audit Trail** - All enrollment attempts logged
3. **Error Messages** - Sensitive info not exposed to end users
4. **Idempotency** - Duplicate enrollments prevented
5. **Data Validation** - All inputs validated before API calls

---

## Next Steps (Epic E1.9)

After enrollment is complete:

1. **Completion Sync** - Sync course completion status from Blackboard
2. **Progress Tracking** - Track learner progress
3. **Certificate Trigger** - Trigger certificate generation on completion

---

## Support

### Blackboard Documentation
- Enrollment API: https://docs.blackboard.com/learn/REST/enrollments
- Course Roles: https://docs.blackboard.com/learn/REST/course-roles

### Internal Contacts
- **Blackboard Admin:** IT Department
- **Course Mapping:** Operations Team
- **Enrollment Issues:** Contact ADMIN role users

---

**Status:** ✅ Backend Complete - Ready for Testing  
**Epic:** E1.8 - Blackboard Enrollment  
**Date:** January 12, 2026
