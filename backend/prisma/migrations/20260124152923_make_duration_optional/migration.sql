-- AlterTable
ALTER TABLE "program_modules" ALTER COLUMN "durationHours" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "durationMinutes" DROP NOT NULL;
