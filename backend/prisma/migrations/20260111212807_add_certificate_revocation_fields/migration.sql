/*
  Warnings:

  - You are about to drop the column `issueDate` on the `certificates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "certificates" DROP COLUMN "issueDate",
ADD COLUMN     "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "revocationReason" TEXT,
ADD COLUMN     "revokedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "certificates_verificationCode_idx" ON "certificates"("verificationCode");
