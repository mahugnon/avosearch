import { ContractDraftStatus, type Contract } from "@prisma/client";
import { BARRISTER_DELIVERED_STATUSES } from "@/lib/contracts/barrister-review";

type ContractDocumentFields = Pick<
  Contract,
  "draftStatus" | "templateId" | "extractedText" | "userQuestion"
>;

export function hasCompletedDraftDocument(contract: ContractDocumentFields): boolean {
  return (
    contract.draftStatus === ContractDraftStatus.COMPLETED &&
    contract.templateId != null &&
    contract.extractedText.trim().length > 0
  );
}

export function hasBarristerDeliveredDocument(
  contract: Pick<Contract, "extractedText">,
  hasDeliveredMission: boolean
): boolean {
  return hasDeliveredMission && contract.extractedText.trim().length > 0;
}

export function hasViewableDocument(
  contract: ContractDocumentFields,
  hasDeliveredMission: boolean
): boolean {
  return hasCompletedDraftDocument(contract) || hasBarristerDeliveredDocument(contract, hasDeliveredMission);
}

export function contractMatchingContext(
  contract: Pick<Contract, "extractedText" | "userQuestion">
): string {
  return contract.extractedText.trim() || contract.userQuestion?.trim() || "";
}

export function isListableClientContract(
  contract: Pick<Contract, "templateId" | "fileUrl" | "extractedText">,
  options?: { hasDeliveredMission?: boolean }
): boolean {
  if (contract.templateId != null || contract.fileUrl != null) return true;
  if (options?.hasDeliveredMission && contract.extractedText.trim().length > 0) return true;
  return false;
}

export const listableClientContractsFilter = {
  OR: [
    { templateId: { not: null } },
    { fileUrl: { not: null } },
    {
      extractedText: { not: "" },
      missions: {
        some: { status: { in: BARRISTER_DELIVERED_STATUSES } },
      },
    },
  ],
};
