/*
  Warnings:

  - You are about to drop the column `email` on the `program_interests` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `program_interests` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[programId,userId]` on the table `program_interests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `program_interests` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "program_interests_programId_email_key";

-- AlterTable
ALTER TABLE "program_interests" DROP COLUMN "email",
DROP COLUMN "phone",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "program_interests_userId_idx" ON "program_interests"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "program_interests_programId_userId_key" ON "program_interests"("programId", "userId");

-- AddForeignKey
ALTER TABLE "program_interests" ADD CONSTRAINT "program_interests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
