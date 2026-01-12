-- AlterTable
ALTER TABLE "cohorts" ADD COLUMN     "instructorId" TEXT;

-- AddForeignKey
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
