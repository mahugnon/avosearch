import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { BARRISTER_DELIVERED_STATUSES } from "@/lib/contracts/barrister-review";

type DownloadAccess =
  | { ok: true; title: string; extractedText: string; reviewedBy: string | null }
  | { ok: false };

export async function canDownloadContract(input: {
  contractId: string;
  userId: string;
  role: Role;
}): Promise<DownloadAccess> {
  const contract = await prisma.contract.findUnique({
    where: { id: input.contractId },
    select: { title: true, extractedText: true, ownerId: true },
  });

  if (!contract?.extractedText.trim()) return { ok: false };

  // Owner (client): the PDF is only available once a barrister has reviewed
  // and delivered the contract.
  if (contract.ownerId === input.userId) {
    const reviewed = await prisma.mission.findFirst({
      where: {
        contractId: input.contractId,
        clientId: input.userId,
        status: { in: BARRISTER_DELIVERED_STATUSES },
      },
      select: { barrister: { select: { name: true } } },
    });
    if (reviewed) {
      return {
        ok: true,
        title: contract.title,
        extractedText: contract.extractedText,
        reviewedBy: reviewed.barrister?.name ?? null,
      };
    }
    return { ok: false };
  }

  // Assigned barrister: can export while working on the review.
  if (input.role === "BARRISTER") {
    const mission = await prisma.mission.findFirst({
      where: { contractId: input.contractId, barristerId: input.userId },
      select: { id: true },
    });
    if (mission) {
      return {
        ok: true,
        title: contract.title,
        extractedText: contract.extractedText,
        reviewedBy: null,
      };
    }
  }

  return { ok: false };
}
