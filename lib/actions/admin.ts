"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { notifyBarristerVerified } from "@/lib/email/notifications";

export async function verifyBarristerAction(profileId: string): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return;

  await prisma.barristerProfile.update({
    where: { id: profileId },
    data: { verified: true },
  });

  const profile = await prisma.barristerProfile.findUnique({
    where: { id: profileId },
    select: { userId: true },
  });
  if (profile) void notifyBarristerVerified(profile.userId);

  revalidatePath("/admin");
}

export async function rejectBarristerAction(profileId: string): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return;

  await prisma.barristerProfile.update({
    where: { id: profileId },
    data: { verified: false, available: false },
  });

  revalidatePath("/admin");
}
