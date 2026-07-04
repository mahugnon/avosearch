-- AlterTable
ALTER TABLE "ContractTemplate" DROP COLUMN "steps";
ALTER TABLE "ContractTemplate" ADD COLUMN "draftGuide" TEXT;
