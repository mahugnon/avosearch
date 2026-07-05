import type { rankBarristersForContract } from "@/lib/matching/select-barrister";
import { MissionType } from "@prisma/client";
import { missionPriceForType } from "@/lib/matching/barristers";

type RankedBarrister = Awaited<ReturnType<typeof rankBarristersForContract>>[number];

export type BarristerMatchView = {
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

export function toBarristerMatchView(entry: RankedBarrister): BarristerMatchView {
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

export function priceForValidationMission(profile: RankedBarrister["profile"]): number {
  const flatFees = (profile.flatFees ?? {}) as Record<string, number>;
  return missionPriceForType(MissionType.VALIDATION, profile.validationPriceCents, flatFees);
}
