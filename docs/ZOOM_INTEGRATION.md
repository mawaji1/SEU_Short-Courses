# Zoom Integration Plan - SEU Short Courses

**Created:** January 18, 2026  
**Status:** Planning  
**Purpose:** Enable live training sessions within the SEU Short Courses platform

---

## Executive Summary

This document outlines the integration of Zoom for live training sessions in the SEU Short Courses platform. The integration will allow:
- Coordinators to schedule sessions from within the app
- Instructors to start classes independently
- Learners to join sessions directly from the platform
- Full attendance tracking and recording management

---

## Integration Approach

### Recommended: Zoom Meeting SDK + API

| Component | Purpose |
|-----------|---------|
| **Zoom REST API** | Create/manage meetings, users, licenses programmatically |
| **Zoom Meeting SDK (Web)** | Embed Zoom meetings directly in the platform |
| **Webhooks** | Track attendance, recording completion, etc. |

---

## Licensing Model

### Billing Structure

```
┌────────────────────────────────────────────────────────────────┐
│  COST IS PER-HOST, NOT PER-STUDENT                            │
│                                                                │
│  • Coordinators: Hold Pro licenses (permanent)                 │
│  • Instructors: Pro licenses (rotated between courses)        │
│  • Students: FREE - Join as participants, no Zoom account     │
└────────────────────────────────────────────────────────────────┘
```

### Recommended License Allocation

| Role | Licenses | Monthly Cost | Notes |
|------|----------|--------------|-------|
| Coordinators | 5 | ~$85 | Permanent staff, schedule meetings |
| Instructors | 10-12 | ~$170-200 | Rotating pool, reassigned between courses |
| **Total** | **15-17** | **~$255-285** | Supports 10-12 concurrent courses |

### Zoom Plan Details

| Plan | Price/License | Meeting Duration | Participants |
|------|--------------|------------------|--------------|
| **Pro** | ~$17/month | 30 hours | 100 |
| **Business** | ~$21/month | 30 hours | 300 |

---

## License Management

### Reassignment Policy

- ✅ Licenses CAN be reassigned between users
- ⚠️ Rate limits apply (~4 transfers per license per month)
- 💡 Buy 1.5x the licenses needed for safe margin

### API-Managed License Flow

```
Course Starts:
  1. Check if instructor has Zoom user → Create if not
  2. Check if instructor has license → Assign Pro license
  3. Create meeting under instructor's Zoom user ID

Course Ends:
  4. Optionally remove license (careful with rate limits)
  5. Reassign to next instructor
```

---

## Architecture

### System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR PLATFORM                            │
├─────────────────────────────────────────────────────────────────┤
│  Coordinator                  Backend                  Zoom API │
│      │                           │                        │     │
│      │ Schedule Course           │                        │     │
│      │──────────────────────────>│                        │     │
│      │                           │ POST /users (if new)   │     │
│      │                           │───────────────────────>│     │
│      │                           │ PATCH assign license   │     │
│      │                           │───────────────────────>│     │
│      │                           │ POST /meetings         │     │
│      │                           │───────────────────────>│     │
│      │                           │<─── meeting_id, etc.   │     │
│      │<── Session Scheduled ─────│                        │     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Instructor                   Frontend               Zoom SDK   │
│      │                           │                        │     │
│      │ Click "Start Class"       │                        │     │
│      │──────────────────────────>│                        │     │
│      │                           │ Get meeting credentials│     │
│      │                           │ (from backend)         │     │
│      │                           │                        │     │
│      │                           │ ZoomMtg.join()         │     │
│      │                           │───────────────────────>│     │
│      │<── Meeting Embedded ──────│<───────────────────────│     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Zoom Account & App Setup

- [ ] Create Zoom Developer Account at [marketplace.zoom.us](https://marketplace.zoom.us)
- [ ] Create Server-to-Server OAuth App (for backend API calls)
- [ ] Create Meeting SDK App (for frontend embedding)
- [ ] Configure required scopes:
  - `user:write:admin`, `user:read:admin`
  - `meeting:write:admin`, `meeting:read:admin`
  - `recording:read:admin` (if recordings needed)
- [ ] Purchase initial licenses (recommend 15-17 Pro)
- [ ] Create coordinator Zoom users

### Phase 2: Backend Implementation

#### New Files to Create

| File | Purpose |
|------|---------|
| `src/modules/zoom/zoom.module.ts` | NestJS module |
| `src/modules/zoom/zoom.service.ts` | API client & business logic |
| `src/modules/zoom/zoom.controller.ts` | REST endpoints |
| `src/modules/zoom/zoom-webhook.controller.ts` | Webhook handler |
| `src/modules/zoom/dto/*.ts` | Request/response DTOs |

#### Key Service Methods

```typescript
// zoom.service.ts

// Authentication
getAccessToken(): Promise<string>

// User Management
createZoomUser(email: string, name: string): Promise<ZoomUser>
assignLicense(userId: string): Promise<void>
removeLicense(userId: string): Promise<void>
listUsers(): Promise<ZoomUser[]>

// Meeting Management
createMeeting(hostId: string, topic: string, startTime: Date, duration: number): Promise<Meeting>
getMeeting(meetingId: string): Promise<Meeting>
deleteMeeting(meetingId: string): Promise<void>
listMeetings(hostId: string): Promise<Meeting[]>

// SDK Authentication
generateSignature(meetingNumber: string, role: number): string

// Webhooks
handleWebhook(event: ZoomWebhookEvent): Promise<void>
```

#### Database Schema Updates

```prisma
// Add to schema.prisma

model User {
  // ... existing fields
  zoomUserId        String?   @unique
  zoomLicenseType   Int?      // 1=Basic, 2=Pro
  zoomLicenseAssignedAt DateTime?
}

model Session {
  id                String   @id @default(cuid())
  cohortId          String
  instructorId      String
  zoomMeetingId     String?  @unique
  zoomJoinUrl       String?
  zoomStartUrl      String?
  startTime         DateTime
  duration          Int      // minutes
  status            SessionStatus @default(SCHEDULED)
  createdAt         DateTime @default(now())
  
  cohort            Cohort   @relation(fields: [cohortId], references: [id])
  instructor        User     @relation(fields: [instructorId], references: [id])
  attendances       SessionAttendance[]
}

model SessionAttendance {
  id                String   @id @default(cuid())
  sessionId         String
  userId            String
  joinTime          DateTime?
  leaveTime         DateTime?
  duration          Int?     // minutes attended
  
  session           Session  @relation(fields: [sessionId], references: [id])
  user              User     @relation(fields: [userId], references: [id])
}

enum SessionStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### Phase 3: Frontend Implementation

#### New Components

| Component | Purpose |
|-----------|---------|
| `ZoomMeetingEmbed.tsx` | Embeds Zoom meeting in the app |
| `SessionScheduler.tsx` | Admin UI for scheduling sessions |
| `SessionCard.tsx` | Displays upcoming/past sessions |
| `JoinSessionButton.tsx` | Student join button |
| `StartSessionButton.tsx` | Instructor start button |

#### Meeting SDK Integration

```tsx
// ZoomMeetingEmbed.tsx
'use client';

import { useEffect, useRef } from 'react';
import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded';

interface Props {
  meetingNumber: string;
  userName: string;
  signature: string;
  sdkKey: string;
  password?: string;
  role: 0 | 1; // 0=participant, 1=host
}

export function ZoomMeetingEmbed({ 
  meetingNumber, 
  userName, 
  signature, 
  sdkKey, 
  password,
  role 
}: Props) {
  const zoomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const client = ZoomMtgEmbedded.createClient();

    client.init({
      zoomAppRoot: zoomRef.current!,
      language: 'ar-SA',
      customize: {
        video: {
          isResizable: true,
          viewSizes: {
            default: { width: 1000, height: 600 }
          }
        }
      }
    }).then(() => {
      client.join({
        sdkKey,
        signature,
        meetingNumber,
        userName,
        password,
        tk: '', // tracking fields
      });
    });

    return () => {
      ZoomMtgEmbedded.destroyClient();
    };
  }, [meetingNumber]);

  return <div ref={zoomRef} className="zoom-container" />;
}
```

### Phase 4: Webhook Integration

#### Events to Handle

| Event | Action |
|-------|--------|
| `meeting.started` | Update session status to IN_PROGRESS |
| `meeting.ended` | Update session status to COMPLETED |
| `meeting.participant_joined` | Create attendance record |
| `meeting.participant_left` | Update attendance duration |
| `recording.completed` | Store recording URL |

#### Webhook Endpoint

```typescript
// zoom-webhook.controller.ts

@Post('webhooks/zoom')
async handleZoomWebhook(@Body() payload: any, @Headers() headers: any) {
  // Verify webhook authenticity
  const isValid = this.zoomService.verifyWebhook(payload, headers);
  if (!isValid) throw new UnauthorizedException();

  // Process event asynchronously
  await this.zoomService.handleWebhook(payload);
  
  return { status: 'ok' };
}
```

---

## Environment Configuration

### Backend (.env)

```env
# Zoom API Configuration
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret

# Zoom SDK Configuration
ZOOM_SDK_KEY=your_sdk_key
ZOOM_SDK_SECRET=your_sdk_secret

# Zoom Webhook
ZOOM_WEBHOOK_SECRET_TOKEN=your_webhook_secret
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_ZOOM_SDK_KEY=your_sdk_key
```

---

## API Endpoints

### Session Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions` | Schedule a new session |
| GET | `/api/sessions/:id` | Get session details |
| GET | `/api/cohorts/:id/sessions` | List cohort sessions |
| DELETE | `/api/sessions/:id` | Cancel session |
| POST | `/api/sessions/:id/join` | Get join credentials |

### Zoom User Management (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/zoom/users` | Create Zoom user |
| GET | `/api/admin/zoom/users` | List Zoom users |
| PATCH | `/api/admin/zoom/users/:id/license` | Assign/remove license |

---

## Security Considerations

1. **SDK Signature** - Generate server-side, expires after meeting
2. **OAuth Tokens** - Store securely, never expose to frontend
3. **Webhook Verification** - Validate all incoming webhook requests
4. **Role Validation** - Verify user role before allowing host actions
5. **Meeting Passwords** - Enable for additional security

---

## Testing Checklist

### Unit Tests
- [ ] Zoom service methods
- [ ] Signature generation
- [ ] Webhook verification

### Integration Tests
- [ ] Create meeting via API
- [ ] Join meeting via SDK
- [ ] Webhook delivery and processing

### Manual Testing
- [ ] Coordinator schedules session
- [ ] Instructor starts class independently
- [ ] Students join from platform
- [ ] Attendance tracking works
- [ ] Recording is accessible after session

---

## Cost Estimation

### Startup (15 licenses)

| Item | Monthly Cost |
|------|-------------|
| 5 Coordinator Pro licenses | ~$85 |
| 10 Instructor Pro licenses | ~$170 |
| **Total** | **~$255/month** |

### Growth Scenarios

| Concurrent Courses | Licenses Needed | Monthly Cost |
|-------------------|-----------------|--------------|
| 5 | 10 | ~$170 |
| 10 | 17 | ~$290 |
| 20 | 30 | ~$510 |
| 50 | 65 | ~$1,100 |

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Account & App Setup | 1-2 days | Zoom account approval |
| Backend Implementation | 3-4 days | Phase 1 complete |
| Frontend Implementation | 2-3 days | Phase 2 complete |
| Webhook Integration | 1-2 days | Backend ready |
| Testing & QA | 2-3 days | All phases complete |
| **Total** | **9-14 days** | |

---

## References

- [Zoom Developer Portal](https://developers.zoom.us/)
- [Meeting SDK Documentation](https://developers.zoom.us/docs/meeting-sdk/)
- [REST API Reference](https://developers.zoom.us/docs/api/)
- [Webhooks Documentation](https://developers.zoom.us/docs/api/rest/webhook-reference/)
- [ISV Partner Program](https://www.zoom.com/en/isv/) (for scaling)

---

## Next Steps

1. **Immediate:** Create Zoom Developer Account
2. **This Week:** Purchase initial licenses, create OAuth app
3. **Week 2:** Begin backend implementation
4. **Week 3:** Frontend SDK integration
5. **Week 4:** Testing and go-live
