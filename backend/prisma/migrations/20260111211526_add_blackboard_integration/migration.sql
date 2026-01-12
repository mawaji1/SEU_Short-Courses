-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('LEARNER', 'COORDINATOR', 'OPERATIONS', 'FINANCE', 'ADMIN');

-- CreateEnum
CREATE TYPE "BlackboardProvisionStatus" AS ENUM ('NOT_PROVISIONED', 'PENDING', 'PROVISIONED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('COURSE', 'WORKSHOP', 'BOOTCAMP', 'CERTIFICATION');

-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('ONLINE', 'IN_PERSON', 'HYBRID');

-- CreateEnum
CREATE TYPE "CohortStatus" AS ENUM ('UPCOMING', 'OPEN', 'FULL', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING_PAYMENT', 'PAYMENT_FAILED', 'CONFIRMED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'TABBY', 'TAMARA');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('PENDING', 'ISSUED', 'REVOKED');

-- CreateEnum
CREATE TYPE "PromoCodeType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REGISTRATION_CONFIRMATION', 'PAYMENT_RECEIPT', 'PAYMENT_FAILED', 'BLACKBOARD_ACCESS', 'SYSTEM_ALERT', 'COURSE_REMINDER', 'CERTIFICATE_READY', 'ENROLLMENT_CONFIRMED', 'COHORT_CANCELLED', 'WAITLIST_AVAILABLE', 'PASSWORD_RESET', 'EMAIL_VERIFICATION');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'QUEUED', 'PROCESSING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('WAITING', 'NOTIFIED', 'CONVERTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "nationalId" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'LEARNER',
    "organizationId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "blackboardUserId" TEXT,
    "blackboardProvisionStatus" "BlackboardProvisionStatus" NOT NULL DEFAULT 'NOT_PROVISIONED',
    "blackboardProvisionedAt" TIMESTAMP(3),
    "blackboardProvisionError" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructors" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "bioAr" TEXT,
    "bioEn" TEXT,
    "imageUrl" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "shortDescriptionAr" TEXT NOT NULL,
    "shortDescriptionEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "ProgramType" NOT NULL DEFAULT 'COURSE',
    "deliveryMode" "DeliveryMode" NOT NULL DEFAULT 'ONLINE',
    "durationHours" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "status" "ProgramStatus" NOT NULL DEFAULT 'DRAFT',
    "categoryId" TEXT NOT NULL,
    "instructorId" TEXT,
    "imageUrl" TEXT,
    "prerequisitesAr" TEXT,
    "prerequisitesEn" TEXT,
    "learningOutcomesAr" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "learningOutcomesEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetAudienceAr" TEXT,
    "targetAudienceEn" TEXT,
    "blackboardCourseId" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohorts" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "registrationStartDate" TIMESTAMP(3) NOT NULL,
    "registrationEndDate" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "enrolledCount" INTEGER NOT NULL DEFAULT 0,
    "status" "CohortStatus" NOT NULL DEFAULT 'UPCOMING',
    "blackboardCourseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "blackboardEnrollmentId" TEXT,
    "blackboardCourseId" TEXT,
    "blackboardRole" TEXT,
    "blackboardSyncStatus" TEXT,
    "blackboardSyncError" TEXT,
    "blackboardSyncedAt" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completionStatus" TEXT,
    "completionPercentage" INTEGER,
    "lastActivityAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "certificateEligible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "providerPaymentId" TEXT,
    "providerTransactionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "refundAmount" DECIMAL(10,2),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "vatAmount" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "status" "CertificateStatus" NOT NULL DEFAULT 'PENDING',
    "verificationCode" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "PromoCodeType" NOT NULL DEFAULT 'PERCENTAGE',
    "value" DECIMAL(10,2) NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "minPurchase" DECIMAL(10,2),
    "maxDiscount" DECIMAL(10,2),
    "programId" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_code_usages" (
    "id" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_code_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'WAITING',
    "notifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "templateId" TEXT NOT NULL,
    "templateData" JSONB NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'ar',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "lastError" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "message" TEXT,
    "errorDetails" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "crNumber" TEXT,
    "vatNumber" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nationalId_key" ON "users"("nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "users_blackboardUserId_key" ON "users"("blackboardUserId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "programs_slug_key" ON "programs"("slug");

-- CreateIndex
CREATE INDEX "programs_status_idx" ON "programs"("status");

-- CreateIndex
CREATE INDEX "programs_categoryId_idx" ON "programs"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "cohorts_blackboardCourseId_key" ON "cohorts"("blackboardCourseId");

-- CreateIndex
CREATE INDEX "cohorts_programId_idx" ON "cohorts"("programId");

-- CreateIndex
CREATE INDEX "cohorts_status_idx" ON "cohorts"("status");

-- CreateIndex
CREATE INDEX "registrations_userId_cohortId_status_idx" ON "registrations"("userId", "cohortId", "status");

-- CreateIndex
CREATE INDEX "registrations_status_idx" ON "registrations"("status");

-- CreateIndex
CREATE INDEX "registrations_expiresAt_idx" ON "registrations"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_registrationId_key" ON "enrollments"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_blackboardEnrollmentId_key" ON "enrollments"("blackboardEnrollmentId");

-- CreateIndex
CREATE INDEX "enrollments_status_idx" ON "enrollments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_registrationId_key" ON "payments"("registrationId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_paymentId_key" ON "invoices"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices"("number");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_enrollmentId_key" ON "certificates"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_number_key" ON "certificates"("number");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_verificationCode_key" ON "certificates"("verificationCode");

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");

-- CreateIndex
CREATE INDEX "promo_codes_code_idx" ON "promo_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "promo_code_usages_promoCodeId_registrationId_key" ON "promo_code_usages"("promoCodeId", "registrationId");

-- CreateIndex
CREATE INDEX "waitlist_entries_cohortId_position_idx" ON "waitlist_entries"("cohortId", "position");

-- CreateIndex
CREATE INDEX "waitlist_entries_status_idx" ON "waitlist_entries"("status");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_entries_userId_cohortId_key" ON "waitlist_entries"("userId", "cohortId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_scheduledAt_idx" ON "notifications"("scheduledAt");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notification_logs_notificationId_idx" ON "notification_logs"("notificationId");

-- CreateIndex
CREATE INDEX "notification_logs_timestamp_idx" ON "notification_logs"("timestamp");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "cohorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "cohorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "cohorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_code_usages" ADD CONSTRAINT "promo_code_usages_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "promo_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
