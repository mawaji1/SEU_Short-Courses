# Blackboard User Provisioning - Integration Guide

## Overview

Epic E1.7 implements automatic user provisioning to Blackboard Learn LMS. When a user registers for a course, they are automatically provisioned to Blackboard with intelligent matching and retry logic.

---

## Architecture

### Components

1. **BlackboardApiClient** - REST API client for Blackboard Learn
2. **BlackboardProvisioningService** - User provisioning orchestrator
3. **BlackboardController** - Admin endpoints for provisioning management

### User Matching Strategy

The system attempts to match users in this order:

1. **Email Match** - Search by email address
2. **National ID Match** - Search by external ID (national ID)
3. **Create New** - If no match found, create new user

---

## Features

### ✅ Implemented

- **OAuth 2.0 Authentication** - Token-based authentication with auto-refresh
- **Intelligent User Matching** - Multi-strategy user matching (email, national ID)
- **Automatic Retry Logic** - Exponential backoff (3 attempts)
- **Provisioning Status Tracking** - Database tracking of provisioning state
- **Admin Alerts** - Email notifications for provisioning failures
- **Bulk Provisioning** - Provision multiple users at once
- **Manual Retry** - Retry failed provisioning attempts

### Provisioning States

```typescript
enum BlackboardProvisionStatus {
  NOT_PROVISIONED  // User not yet provisioned
  PENDING          // Provisioning in progress
  PROVISIONED      // Successfully provisioned
  FAILED           // Provisioning failed after retries
}
```

---

## Database Schema

### User Model Updates

```prisma
model User {
  // ... existing fields
  
  nationalId                 String?                    @unique
  blackboardUserId           String?                    @unique
  blackboardProvisionStatus  BlackboardProvisionStatus  @default(NOT_PROVISIONED)
  blackboardProvisionedAt    DateTime?
  blackboardProvisionError   String?
}
```

### Migration Required

```bash
cd backend
npx prisma migrate dev --name add_blackboard_provisioning
```

---

## Environment Variables

Add to `/backend/.env`:

```bash
# Blackboard Integration
BLACKBOARD_API_URL=https://blackboard.seu.edu.sa
BLACKBOARD_CLIENT_ID=your_client_id_here
BLACKBOARD_CLIENT_SECRET=your_client_secret_here

# Admin notifications
ADMIN_EMAIL=admin@seu.edu.sa
```

---

## API Endpoints

### Provision Single User
```http
POST /api/blackboard/provision/:userId
Authorization: Bearer {jwt_token}
Roles: ADMIN, OPERATIONS

Response:
{
  "success": true,
  "blackboardUserId": "bb_user_123",
  "action": "created" | "matched" | "failed",
  "error": null
}
```

### Bulk Provision Users
```http
POST /api/blackboard/provision/bulk
Authorization: Bearer {jwt_token}
Roles: ADMIN
Content-Type: application/json

Body:
{
  "userIds": ["user1", "user2", "user3"]
}

Response:
{
  "successful": 2,
  "failed": 1,
  "total": 3,
  "results": [...]
}
```

### Get Provisioning Status
```http
GET /api/blackboard/provision/status/:userId
Authorization: Bearer {jwt_token}
Roles: ADMIN, OPERATIONS

Response:
{
  "status": "PROVISIONED",
  "blackboardUserId": "bb_user_123",
  "provisionedAt": "2026-01-12T00:30:00Z",
  "error": null
}
```

### Retry Failed Provisioning
```http
POST /api/blackboard/provision/retry/:userId
Authorization: Bearer {jwt_token}
Roles: ADMIN, OPERATIONS

Response:
{
  "success": true,
  "blackboardUserId": "bb_user_123",
  "action": "created",
  "error": null
}
```

---

## Usage Examples

### Automatic Provisioning (Future Integration)

```typescript
// In RegistrationService after payment confirmation
async confirmPayment(registrationId: string) {
  // ... payment confirmation logic
  
  // Provision user to Blackboard
  await this.blackboardProvisioningService.provisionUser(userId);
}
```

### Manual Provisioning

```typescript
// Provision single user
const result = await blackboardProvisioningService.provisionUser('user_123');

if (result.success) {
  console.log(`User provisioned: ${result.blackboardUserId}`);
} else {
  console.error(`Provisioning failed: ${result.error}`);
}
```

### Bulk Provisioning

```typescript
// Provision multiple users
const userIds = ['user1', 'user2', 'user3'];
const result = await blackboardProvisioningService.bulkProvisionUsers(userIds);

console.log(`Success: ${result.successful}, Failed: ${result.failed}`);
```

---

## Error Handling

### Retry Logic

- **Max Retries:** 3 attempts
- **Backoff Strategy:** Exponential (2s, 4s, 8s)
- **Final Failure:** Admin alert sent via email

### Admin Alerts

When provisioning fails after all retries:

```
Subject: [ADMIN ALERT] Blackboard User Provisioning Failed

Failed to provision user to Blackboard after 3 attempts.

User: user@example.com
User ID: user_123
Error: Connection timeout
```

---

## Blackboard API Reference

### Required Endpoints

1. **OAuth Token**
   - `POST /learn/api/public/v1/oauth2/token`
   - Grant type: `client_credentials`

2. **User Search**
   - `GET /learn/api/public/v1/users?email={email}`
   - `GET /learn/api/public/v1/users?externalId={nationalId}`

3. **User Management**
   - `POST /learn/api/public/v1/users` - Create user
   - `PATCH /learn/api/public/v1/users/{userId}` - Update user
   - `GET /learn/api/public/v1/users/{userId}` - Get user

### User Object Structure

```json
{
  "userName": "user123",
  "externalId": "1234567890",
  "name": {
    "given": "Ahmed",
    "family": "AlSaeed"
  },
  "contact": {
    "email": "ahmed@example.com"
  },
  "availability": {
    "available": "Yes"
  }
}
```

---

## Testing Checklist

### Unit Tests
- [ ] BlackboardApiClient authentication
- [ ] User matching strategies
- [ ] Retry logic
- [ ] Error handling

### Integration Tests
- [ ] Blackboard API connectivity
- [ ] User creation flow
- [ ] User matching flow
- [ ] Bulk provisioning

### Manual Testing
1. Test with Blackboard sandbox environment
2. Verify user matching by email
3. Verify user matching by national ID
4. Test new user creation
5. Test retry logic (simulate failures)
6. Verify admin alerts
7. Test bulk provisioning

---

## Monitoring

### Key Metrics

- Provisioning success rate
- Average provisioning time
- Retry frequency
- Failed provisioning count

### Logs

```typescript
// Success
[BlackboardProvisioningService] Successfully provisioned user: user@example.com

// Retry
[BlackboardProvisioningService] Provisioning attempt 2/3 failed for user: user@example.com

// Failure
[BlackboardProvisioningService] Provisioning failed for user: user@example.com
```

---

## Security Considerations

1. **OAuth Credentials** - Store securely in environment variables
2. **Token Caching** - Access tokens cached and auto-refreshed
3. **RBAC** - Only ADMIN and OPERATIONS roles can provision
4. **Audit Trail** - All provisioning attempts logged in database
5. **Error Messages** - Sensitive info not exposed to end users

---

## Next Steps (Epic E1.8)

After user provisioning is complete:

1. **Course Enrollment** - Enroll provisioned users in Blackboard courses
2. **Role Assignment** - Assign learner/instructor roles
3. **Enrollment Sync** - Keep enrollment status in sync

---

## Support

### Blackboard Documentation
- REST API: https://docs.blackboard.com/
- OAuth 2.0: https://docs.blackboard.com/learn/REST/getting-started-with-rest

### Internal Contacts
- **Blackboard Admin:** IT Department
- **API Credentials:** Contact IT for client ID/secret
- **Sandbox Access:** Request from IT for testing

---

**Status:** ✅ Backend Complete - Ready for Testing  
**Epic:** E1.7 - Blackboard User Provisioning  
**Date:** January 12, 2026
