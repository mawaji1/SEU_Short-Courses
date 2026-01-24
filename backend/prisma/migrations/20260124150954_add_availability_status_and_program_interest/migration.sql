/*
  Warnings:

  - You are about to drop the `_ProgramInstructors` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('COMING_SOON', 'UPCOMING', 'AVAILABLE', 'SOLD_OUT');

-- DropForeignKey
ALTER TABLE "_ProgramInstructors" DROP CONSTRAINT "_ProgramInstructors_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProgramInstructors" DROP CONSTRAINT "_ProgramInstructors_B_fkey";

-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'COMING_SOON',
ALTER COLUMN "durationHours" DROP NOT NULL;

-- DropTable
DROP TABLE "_ProgramInstructors";

-- CreateTable
CREATE TABLE "program_interests" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" TIMESTAMP(3),

    CONSTRAINT "program_interests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "program_interests_programId_idx" ON "program_interests"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "program_interests_programId_email_key" ON "program_interests"("programId", "email");

-- CreateIndex
CREATE INDEX "programs_availabilityStatus_idx" ON "programs"("availabilityStatus");

-- AddForeignKey
ALTER TABLE "program_interests" ADD CONSTRAINT "program_interests_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
