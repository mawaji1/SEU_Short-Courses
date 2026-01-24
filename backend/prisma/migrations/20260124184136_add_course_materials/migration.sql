-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('PDF', 'VIDEO', 'DOCUMENT', 'LINK', 'PRESENTATION', 'OTHER');

-- CreateTable
CREATE TABLE "course_materials" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "moduleId" TEXT,
    "sessionId" TEXT,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "type" "MaterialType" NOT NULL DEFAULT 'DOCUMENT',
    "fileUrl" TEXT,
    "externalLink" TEXT,
    "fileSize" INTEGER,
    "fileName" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_materials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "course_materials_programId_idx" ON "course_materials"("programId");

-- CreateIndex
CREATE INDEX "course_materials_moduleId_idx" ON "course_materials"("moduleId");

-- CreateIndex
CREATE INDEX "course_materials_sessionId_idx" ON "course_materials"("sessionId");

-- CreateIndex
CREATE INDEX "course_materials_sortOrder_idx" ON "course_materials"("sortOrder");

-- AddForeignKey
ALTER TABLE "course_materials" ADD CONSTRAINT "course_materials_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
