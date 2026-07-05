"use server";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notifyNewMessage } from "@/lib/email/notifications";
import { storage } from "@/lib/storage";

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIMES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

export async function sendMissionMessageFormAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "unauthorized" as const };

  const missionId = String(formData.get("missionId") ?? "");
  const text = String(formData.get("body") ?? "").trim();
  const file = formData.get("attachment");

  if (!text && !(file instanceof File && file.size > 0)) {
    return { error: "empty" as const };
  }

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    select: { clientId: true, barristerId: true },
  });

  if (!mission) return { error: "not_found" as const };
  const isParticipant =
    mission.clientId === session.user.id || mission.barristerId === session.user.id;
  if (!isParticipant) return { error: "forbidden" as const };

  let attachmentUrl: string | undefined;
  let attachmentName: string | undefined;
  let attachmentMime: string | undefined;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_ATTACHMENT_BYTES) return { error: "file_too_large" as const };
    if (!ALLOWED_MIMES.has(file.type)) return { error: "unsupported_file" as const };

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `missions/${missionId}/${randomUUID()}-${file.name}`;
    await storage.save(key, buffer, file.type);
    attachmentUrl = `/api/missions/attachments/${encodeURIComponent(key)}`;
    attachmentName = file.name;
    attachmentMime = file.type;
  }

  await prisma.message.create({
    data: {
      missionId,
      senderId: session.user.id,
      body: text || "📎 Pièce jointe",
      attachmentUrl: attachmentUrl ?? null,
      attachmentName: attachmentName ?? null,
      attachmentMime: attachmentMime ?? null,
    },
  });

  const recipientId =
    session.user.id === mission.clientId ? mission.barristerId : mission.clientId;
  if (recipientId) {
    void notifyNewMessage(missionId, recipientId, text || attachmentName || "Pièce jointe");
  }

  return {
    ok: true as const,
    attachmentUrl,
    attachmentName,
  };
}

export async function getMissionMessages(missionId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    select: { clientId: true, barristerId: true },
  });
  if (!mission) return [];
  const isParticipant =
    mission.clientId === session.user.id || mission.barristerId === session.user.id;
  if (!isParticipant) return [];

  return prisma.message.findMany({
    where: { missionId },
    include: { sender: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });
}
