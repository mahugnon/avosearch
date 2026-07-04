-- AlterTable: template body optional, file reference for storage-backed templates
ALTER TABLE "ContractTemplate" ALTER COLUMN "body" DROP NOT NULL;
ALTER TABLE "ContractTemplate" ADD COLUMN "fileKey" TEXT,
ADD COLUMN "fileName" TEXT,
ADD COLUMN "mimeType" TEXT;
