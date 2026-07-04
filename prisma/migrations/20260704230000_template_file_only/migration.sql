-- Template content lives in storage; DB keeps metadata and detected placeholders only.
ALTER TABLE "ContractTemplate" DROP COLUMN "body";
ALTER TABLE "ContractTemplate" ADD COLUMN "placeholders" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
