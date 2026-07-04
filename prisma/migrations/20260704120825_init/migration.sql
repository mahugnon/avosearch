-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'LAWYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TriageResult" AS ENUM ('IA_SUFFIT', 'AVOCAT_RECOMMANDE', 'ACTE_REGLEMENTE');

-- CreateEnum
CREATE TYPE "RequiredPro" AS ENUM ('AVOCAT', 'NOTAIRE');

-- CreateEnum
CREATE TYPE "ModStatus" AS ENUM ('PROPOSEE', 'ACCEPTEE_CLIENT', 'REJETEE_CLIENT', 'AMENDEE_AVOCAT', 'VALIDEE_AVOCAT', 'REJETEE_AVOCAT');

-- CreateEnum
CREATE TYPE "MissionType" AS ENUM ('VALIDATION', 'RELECTURE', 'REDACTION', 'NEGOCIATION');

-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('PROPOSEE', 'ACCEPTEE', 'EN_COURS', 'LIVREE', 'TERMINEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('FAIBLE', 'MOYEN', 'ELEVE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawyerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barreau" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "specialties" TEXT[],
    "bio" TEXT NOT NULL,
    "validationPriceCents" INTEGER NOT NULL,
    "flatFees" JSONB NOT NULL,
    "responseTimeHours" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LawyerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT,
    "mimeType" TEXT,
    "extractedText" TEXT NOT NULL,
    "userQuestion" TEXT,
    "aiConsentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "triage" "TriageResult" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "domain" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "flags" TEXT[],
    "requiredPro" "RequiredPro",
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modification" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "originalExcerpt" TEXT NOT NULL,
    "proposedText" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "status" "ModStatus" NOT NULL DEFAULT 'PROPOSEE',
    "amendedText" TEXT,
    "lawyerComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Modification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" TEXT NOT NULL,
    "type" "MissionType" NOT NULL,
    "contractId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "lawyerId" TEXT,
    "priceCents" INTEGER NOT NULL,
    "status" "MissionStatus" NOT NULL DEFAULT 'PROPOSEE',
    "deadline" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "globalNote" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LawyerProfile_userId_key" ON "LawyerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_contractId_key" ON "Analysis"("contractId");

-- CreateIndex
CREATE UNIQUE INDEX "Modification_analysisId_order_key" ON "Modification"("analysisId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Review_missionId_key" ON "Review"("missionId");

-- AddForeignKey
ALTER TABLE "LawyerProfile" ADD CONSTRAINT "LawyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modification" ADD CONSTRAINT "Modification_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
