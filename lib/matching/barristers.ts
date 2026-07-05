import { prisma } from "@/lib/db";
import { rankBarristersForContract } from "@/lib/matching/select-barrister";

export async function matchBarristersForContract(contractId: string, limit = 5) {
  const ranked = await rankBarristersForContract(contractId, limit);
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
