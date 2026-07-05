import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function canDownloadContract(input: {
  contractId: string;
  userId: string;
  role: Role;
}): Promise<{ ok: true; title: string; extractedText: string } | { ok: false }> {
  const contract = await prisma.contract.findUnique({
    where: { id: input.contractId },
    select: { title: true, extractedText: true, ownerId: true },
  });

  if (!contract?.extractedText.trim()) return { ok: false };

  if (contract.ownerId === input.userId) {
    return { ok: true, title: contract.title, extractedText: contract.extractedText };
  }

  if (input.role === "LAWYER") {
    const mission = await prisma.mission.findFirst({
      where: { contractId: input.contractId, lawyerId: input.userId },
      select: { id: true },
    });
    if (mission) {
      return { ok: true, title: contract.title, extractedText: contract.extractedText };
    }
  }

  return { ok: false };
}
