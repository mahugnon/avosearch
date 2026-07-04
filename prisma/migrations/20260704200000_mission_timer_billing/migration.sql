-- AlterTable
ALTER TABLE "LawyerProfile" ADD COLUMN "hourlyRateCents" INTEGER NOT NULL DEFAULT 15000;

-- AlterTable
ALTER TABLE "Mission" ADD COLUMN "finalPriceCents" INTEGER,
ADD COLUMN "hourlyRateCents" INTEGER,
ADD COLUMN "workStartedAt" TIMESTAMP(3),
ADD COLUMN "workDurationSeconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "autoAssigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "selectionScore" DOUBLE PRECISION;
