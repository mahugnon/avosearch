import { prisma } from "@/lib/db";

export async function getContractForClient(contractId: string, userId: string) {
  return prisma.contract.findFirst({
    where: { id: contractId, ownerId: userId },
    include: { analysis: true },
  });
}

export function assertClientSession(session: { user: { id: string; role: string } } | null) {
  if (!session?.user?.id || session.user.role !== "CLIENT") {
    throw new Error("UNAUTHORIZED");
  }
  return session.user.id;
}
