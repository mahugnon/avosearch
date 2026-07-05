-- Rename lawyer terminology to barrister across schema
ALTER TYPE "Role" RENAME VALUE 'LAWYER' TO 'BARRISTER';

ALTER TABLE "LawyerProfile" RENAME TO "BarristerProfile";

ALTER TABLE "Mission" RENAME COLUMN "lawyerId" TO "barristerId";

ALTER TABLE "Modification" RENAME COLUMN "lawyerComment" TO "barristerComment";

ALTER TABLE "BarristerProfile" RENAME CONSTRAINT "LawyerProfile_pkey" TO "BarristerProfile_pkey";
ALTER TABLE "BarristerProfile" RENAME CONSTRAINT "LawyerProfile_userId_fkey" TO "BarristerProfile_userId_fkey";
ALTER INDEX "LawyerProfile_userId_key" RENAME TO "BarristerProfile_userId_key";
ALTER TABLE "Mission" RENAME CONSTRAINT "Mission_lawyerId_fkey" TO "Mission_barristerId_fkey";
