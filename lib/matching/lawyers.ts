import { prisma } from "@/lib/db";
import { rankLawyersForContract } from "@/lib/matching/select-lawyer";

export async function matchLawyersForContract(contractId: string, limit = 5) {
  const ranked = await rankLawyersForContract(contractId, limit);
  return ranked.map(({ profile }) => profile);
}

export function missionPriceForType(
  type: "VALIDATION" | "RELECTURE" | "REDACTION" | "NEGOCIATION",
  validationPriceCents: number,
  flatFees: Record<string, number>
): number {
  if (type === "VALIDATION") return validationPriceCents;
  return flatFees[type] ?? flatFees.RELECTURE ?? validationPriceCents * 3;
}
