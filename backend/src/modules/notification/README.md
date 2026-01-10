# Notification Module - Production-Grade Email System

## Overview

The Notification Module is a production-ready, scalable email notification system built with:
- **Async Queue Processing** (Bull + Redis)
- **Retry Logic** with exponential backoff
- **Delivery Tracking** and status monitoring
- **Template Engine** (Handlebars)
- **Multi-language Support** (AR/EN)
- **Priority-based Queuing**

## Architecture

```
┌─────────────────┐
│  Service Layer  │ → Creates notification record
└────────┬────────┘
         ↓
┌─────────────────┐
│   Bull Queue    │ → Async processing with retry
└────────┬────────┘
         ↓
┌─────────────────┐
│ Email Processor │ → Sends email via SMTP
└────────┬────────┘
         ↓
┌─────────────────┐
│   Database      │ → Tracks delivery status
└─────────────────┘
```

## Features

### 1. Async Processing
- Non-blocking email sending
- Queue-based with Bull (Redis)
- Priority-based job processing
- Configurable delays based on priority

### 2. Retry Logic
- Automatic retry on failure (default: 3 attempts)
- Exponential backoff (5s, 10s, 20s)
- Dead letter queue for failed notifications
- Manual retry capability

### 3. Delivery Tracking
- Database-backed notification logs
- Status tracking: PENDING → QUEUED → PROCESSING → SENT → DELIVERED/FAILED
- Detailed error logging
- Audit trail for compliance

### 4. Template System
- Handlebars templates
- Multi-language support (AR/EN)
- Responsive HTML emails
- SEU branding

### 5. Notification Types
- `REGISTRATION_CONFIRMATION` - After user registers
- `PAYMENT_RECEIPT` - After successful payment
- `PAYMENT_FAILED` - When payment fails
- `BLACKBOARD_ACCESS` - LMS credentials
- `COURSE_REMINDER` - Course start reminders
- `CERTIFICATE_READY` - Certificate generation
- `ENROLLMENT_CONFIRMED` - Enrollment confirmation
- `COHORT_CANCELLED` - Cohort cancellation
- `WAITLIST_AVAILABLE` - Seat available from waitlist
- `PASSWORD_RESET` - Password reset link
- `EMAIL_VERIFICATION` - Email verification

## Setup

### 1. Install Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

### 2. Configure Environment Variables

Add to `.env`:

```env
# Redis (for Bull queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email/SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_NAME=SEU التدريب الاحترافي
SMTP_FROM_EMAIL=noreply@seu.edu.sa
```

### 3. Gmail App Password Setup

1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password
4. Use the generated password in `SMTP_PASS`

### 4. Production SMTP (AWS SES)

For production, use AWS SES:

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_aws_ses_smtp_username
SMTP_PASS=your_aws_ses_smtp_password
```

## Usage

### Sending Notifications

#### Registration Confirmation
```typescript
await notificationService.sendRegistrationConfirmation(
  userId,
  email,
  {
    userName: 'أحمد محمد',
    programName: 'أساسيات الذكاء الاصطناعي',
    cohortName: 'الموعد الأول - يناير 2026',
    registrationId: 'reg_123',
    amount: '1800',
  },
  'ar', // locale
);
```

#### Payment Receipt
```typescript
await notificationService.sendPaymentReceipt(
  userId,
  email,
  {
    userName: 'أحمد محمد',
    programName: 'أساسيات الذكاء الاصطناعي',
    cohortName: 'الموعد الأول',
    amount: '1800',
    paymentId: 'pay_123',
    registrationId: 'reg_123',
    invoiceUrl: 'https://...',
  },
  'ar',
);
```

#### Blackboard Access
```typescript
await notificationService.sendBlackboardAccess(
  userId,
  email,
  {
    userName: 'أحمد محمد',
    programName: 'أساسيات الذكاء الاصطناعي',
    cohortName: 'الموعد الأول',
    blackboardUrl: 'https://lms.seu.edu.sa',
    blackboardUsername: 'ahmad.mohammed',
    blackboardPassword: 'temp_password_123',
  },
  'ar',
);
```

### Custom Notifications
```typescript
await notificationService.sendNotification({
  userId: 'user_123',
  type: NotificationType.COURSE_REMINDER,
  channel: NotificationChannel.EMAIL,
  recipient: 'user@example.com',
  subject: 'تذكير ببدء البرنامج',
  templateId: 'course-reminder',
  templateData: {
    userName: 'أحمد',
    programName: 'البرنامج التدريبي',
    startDate: '2026-01-15',
  },
  locale: 'ar',
  priority: NotificationPriority.HIGH,
});
```

## Templates

Templates are located in `src/modules/notification/templates/{locale}/{template-id}.hbs`

### Available Templates (Arabic)
- `ar/registration-confirmation.hbs`
- `ar/payment-receipt.hbs`
- `ar/payment-failed.hbs`
- `ar/blackboard-access.hbs`

### Creating New Templates

1. Create template file: `templates/ar/my-template.hbs`
2. Use Handlebars syntax:
```handlebars
<h1>مرحباً {{userName}}</h1>
<p>{{message}}</p>
```

3. Send notification with template:
```typescript
await notificationService.sendNotification({
  templateId: 'my-template',
  templateData: {
    userName: 'أحمد',
    message: 'رسالتك هنا',
  },
  // ...
});
```

## Monitoring

### Check Notification Status
```typescript
const status = await notificationService.getNotificationStatus(notificationId);
console.log(status.status); // SENT, DELIVERED, FAILED, etc.
console.log(status.logs); // Delivery logs
```

### Get User Notifications
```typescript
const notifications = await notificationService.getUserNotifications(userId, 50);
```

### Retry Failed Notification
```typescript
await notificationService.retryNotification(notificationId);
```

## API Endpoints

### Get User Notifications
```
GET /api/notifications
Authorization: Bearer {token}
```

### Get Notification Status
```
GET /api/notifications/:id
Authorization: Bearer {token}
```

### Retry Notification
```
POST /api/notifications/:id/retry
Authorization: Bearer {token}
```

## Database Schema

### Notification Table
- `id` - Unique identifier
- `userId` - User reference
- `type` - Notification type enum
- `channel` - EMAIL, SMS, PUSH, IN_APP
- `status` - PENDING, QUEUED, PROCESSING, SENT, DELIVERED, FAILED
- `priority` - LOW, NORMAL, HIGH, URGENT
- `recipient` - Email or phone
- `templateId` - Template identifier
- `templateData` - JSON data for template
- `retryCount` - Number of retry attempts
- `sentAt`, `deliveredAt`, `failedAt` - Timestamps
- `lastError` - Error message if failed

### NotificationLog Table
- `id` - Unique identifier
- `notificationId` - Notification reference
- `status` - Status at this log entry
- `message` - Log message
- `errorDetails` - JSON error details
- `timestamp` - Log timestamp

## Performance

### Queue Configuration
- **Default Attempts:** 3
- **Backoff:** Exponential (5s base)
- **Completed Jobs Retention:** Last 100
- **Failed Jobs Retention:** Last 500

### Priority Processing
- **URGENT:** Immediate (0ms delay)
- **HIGH:** 1 second delay
- **NORMAL:** 5 seconds delay
- **LOW:** 30 seconds delay

## Error Handling

### Automatic Retry
- Failed emails are automatically retried 3 times
- Exponential backoff prevents overwhelming SMTP server
- After all retries exhausted, notification marked as FAILED

### Manual Intervention
- Failed notifications can be manually retried
- Admin can view error logs
- Dead letter queue for permanent failures

## Best Practices

1. **Always use try-catch** when sending notifications
2. **Don't fail transactions** if email fails
3. **Use appropriate priority** levels
4. **Monitor failed notifications** regularly
5. **Keep templates responsive** and tested
6. **Use template versioning** for major changes
7. **Test with real SMTP** before production

## Troubleshooting

### Emails Not Sending
1. Check Redis is running: `redis-cli ping`
2. Verify SMTP credentials in `.env`
3. Check notification logs in database
4. Review Bull queue dashboard

### Gmail Blocking
- Use App Password, not regular password
- Enable "Less secure app access" if needed
- Check Gmail sending limits (500/day)

### High Failure Rate
- Check SMTP server status
- Verify email addresses are valid
- Review error logs for patterns
- Consider rate limiting

## Production Checklist

- [ ] Redis configured with persistence
- [ ] AWS SES or production SMTP configured
- [ ] Email domain verified (SPF, DKIM, DMARC)
- [ ] Monitoring and alerting set up
- [ ] Dead letter queue handler implemented
- [ ] Rate limiting configured
- [ ] Template testing completed
- [ ] Bounce handling implemented
- [ ] Unsubscribe mechanism added
- [ ] Compliance (GDPR, CAN-SPAM) verified

## Future Enhancements

- [ ] SMS notifications (Twilio/AWS SNS)
- [ ] Push notifications (FCM)
- [ ] In-app notifications
- [ ] Email analytics (open rate, click rate)
- [ ] A/B testing for templates
- [ ] Scheduled notifications
- [ ] Batch sending optimization
- [ ] Webhook delivery for external systems
