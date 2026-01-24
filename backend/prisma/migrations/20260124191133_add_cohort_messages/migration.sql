-- CreateTable
CREATE TABLE "cohort_messages" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "instructorId" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohort_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_read_receipts" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_read_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cohort_messages_cohortId_idx" ON "cohort_messages"("cohortId");

-- CreateIndex
CREATE INDEX "cohort_messages_sentAt_idx" ON "cohort_messages"("sentAt");

-- CreateIndex
CREATE INDEX "message_read_receipts_messageId_idx" ON "message_read_receipts"("messageId");

-- CreateIndex
CREATE INDEX "message_read_receipts_userId_idx" ON "message_read_receipts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "message_read_receipts_messageId_userId_key" ON "message_read_receipts"("messageId", "userId");

-- AddForeignKey
ALTER TABLE "cohort_messages" ADD CONSTRAINT "cohort_messages_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_messages" ADD CONSTRAINT "cohort_messages_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_read_receipts" ADD CONSTRAINT "message_read_receipts_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "cohort_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_read_receipts" ADD CONSTRAINT "message_read_receipts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "cohorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
