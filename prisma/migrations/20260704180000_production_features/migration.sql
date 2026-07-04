-- AlterTable
ALTER TABLE "Message" ADD COLUMN "attachmentUrl" TEXT,
ADD COLUMN "attachmentName" TEXT,
ADD COLUMN "attachmentMime" TEXT;

-- AlterTable
ALTER TABLE "Mission" ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "stripeSessionId" TEXT;

-- CreateTable
CREATE TABLE "ProcessedStripeEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedStripeEvent_pkey" PRIMARY KEY ("id")
);
