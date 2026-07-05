"use server";

import { prisma } from "@/lib/db";
import { auth, signOut } from "@/lib/auth";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export type AccountExport = {
  exportedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
  };
  contracts: Array<{
    id: string;
    title: string;
    userQuestion: string | null;
    extractedText: string;
    aiConsentAt: string | null;
    createdAt: string;
    analysis: unknown;
    missions: unknown[];
  }>;
};

export async function exportAccountDataAction(): Promise<AccountExport | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      contracts: {
        include: {
          analysis: { include: { modifications: true } },
          missions: { include: { messages: true, review: true } },
        },
      },
    },
  });

  if (!user) return { error: "not_found" };

  return {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    },
    contracts: user.contracts.map((c) => ({
      id: c.id,
      title: c.title,
      userQuestion: c.userQuestion,
      extractedText: c.extractedText,
      aiConsentAt: c.aiConsentAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
      analysis: c.analysis,
      missions: c.missions,
    })),
  };
}

export async function deleteAccountAction() {
  const session = await auth();
  if (!session?.user?.id) return { error: "unauthorized" };

  await prisma.user.delete({ where: { id: session.user.id } });
  await signOut({ redirect: false });

  const locale = (await getLocale()) as AppLocale;
  redirect(localizedPath("/", locale));
}

export async function submitMissionReviewAction(input: {
  missionId: string;
  rating: number;
  comment?: string;
}) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") return { error: "unauthorized" };

  const mission = await prisma.mission.findFirst({
    where: { id: input.missionId, clientId: session.user.id, status: "LIVREE" },
    include: { review: true, barrister: { include: { barristerProfile: true } } },
  });

  if (!mission) return { error: "not_found" };
  if (mission.review) return { error: "already_reviewed" };

  const rating = Math.min(5, Math.max(1, Math.round(input.rating)));

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        missionId: mission.id,
        rating,
        comment: input.comment?.trim() || null,
      },
    });

    const profile = mission.barrister?.barristerProfile;
    if (profile) {
      const newCount = profile.ratingCount + 1;
      const newRating =
        profile.rating == null
          ? rating
          : (profile.rating * profile.ratingCount + rating) / newCount;
      await tx.barristerProfile.update({
        where: { id: profile.id },
        data: { rating: newRating, ratingCount: newCount },
      });
    }

    await tx.mission.update({
      where: { id: mission.id },
      data: { status: "TERMINEE" },
    });
  });

  return { ok: true as const };
}
