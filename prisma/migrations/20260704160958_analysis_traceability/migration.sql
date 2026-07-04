-- AlterTable
ALTER TABLE "Analysis" ADD COLUMN     "guardrailNotes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "outOfScope" BOOLEAN NOT NULL DEFAULT false;
