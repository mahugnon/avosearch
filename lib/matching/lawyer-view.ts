import type { rankLawyersForContract } from "@/lib/matching/select-lawyer";
import { MissionType } from "@prisma/client";
import { missionPriceForType } from "@/lib/matching/lawyers";

type RankedLawyer = Awaited<ReturnType<typeof rankLawyersForContract>>[number];

export type LawyerMatchView = {
  userId: string;
  name: string;
  photoUrl: string | null;
  barreau: string;
  city: string;
  specialties: string[];
  validationPriceCents: number;
  responseTimeHours: number;
  rating: number | null;
  ratingCount: number;
  score: number;
  matchReason?: string;
};

export function toLawyerMatchView(entry: RankedLawyer): LawyerMatchView {
  const { profile, breakdown } = entry;
  return {
    userId: profile.userId,
    name: profile.user.name,
    photoUrl: profile.photoUrl,
    barreau: profile.barreau,
    city: profile.city,
    specialties: profile.specialties,
    validationPriceCents: profile.validationPriceCents,
    responseTimeHours: profile.responseTimeHours,
    rating: profile.rating,
    ratingCount: profile.ratingCount,
    score: breakdown.total,
    matchReason: entry.llmReason,
  };
}

export function priceForValidationMission(profile: RankedLawyer["profile"]): number {
  const flatFees = (profile.flatFees ?? {}) as Record<string, number>;
  return missionPriceForType(MissionType.VALIDATION, profile.validationPriceCents, flatFees);
}
