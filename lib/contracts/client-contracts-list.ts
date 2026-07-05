import { ContractDraftStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  getActiveMissionContractIds,
  getReviewBarristersByContractIds,
  type ContractReviewBarrister,
} from "@/lib/contracts/barrister-review";
import { listableClientContractsFilter } from "@/lib/contracts/document";

export type ClientContractView = "cards" | "list";

export type ClientContractsFilters = {
  q: string;
  view: ClientContractView;
};

export type ClientContractRow = {
  id: string;
  title: string;
  createdAt: Date;
  draftStatus: ContractDraftStatus | null;
  reviewedBarrister: ContractReviewBarrister | null;
  missionInProgress: boolean;
};

export function parseClientContractsFilters(input: {
  q?: string;
  view?: string;
}): ClientContractsFilters {
  return {
    q: input.q?.trim() ?? "",
    view: input.view === "list" ? "list" : "cards",
  };
}

export async function listClientContracts(
  ownerId: string,
  filters: ClientContractsFilters
): Promise<ClientContractRow[]> {
  const contracts = await prisma.contract.findMany({
    where: {
      ownerId,
      ...listableClientContractsFilter,
      ...(filters.q
        ? { title: { contains: filters.q, mode: "insensitive" as const } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      draftStatus: true,
    },
  });

  const ids = contracts.map((c) => c.id);
  const [barristersByContract, inProgressIds] = await Promise.all([
    getReviewBarristersByContractIds(ids),
    getActiveMissionContractIds(ids, ownerId),
  ]);

  return contracts.map((contract) => ({
    ...contract,
    reviewedBarrister: barristersByContract.get(contract.id) ?? null,
    missionInProgress: inProgressIds.has(contract.id),
  }));
}
