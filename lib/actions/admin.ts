"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { notifyLawyerVerified } from "@/lib/email/notifications";

export async function verifyLawyerAction(profileId: string): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return;

  await prisma.lawyerProfile.update({
    where: { id: profileId },
    data: { verified: true },
  });

  const profile = await prisma.lawyerProfile.findUnique({
    where: { id: profileId },
    select: { userId: true },
  });
  if (profile) void notifyLawyerVerified(profile.userId);

  revalidatePath("/admin");
}

export async function rejectLawyerAction(profileId: string): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return;

  await prisma.lawyerProfile.update({
    where: { id: profileId },
    data: { verified: false, available: false },
  });

  revalidatePath("/admin");
}
