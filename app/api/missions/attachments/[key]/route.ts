import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { storage } from "@/lib/storage";

type RouteContext = { params: Promise<{ key: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key: encodedKey } = await context.params;
  const storageKey = decodeURIComponent(encodedKey);

  if (!storageKey.startsWith("missions/")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const missionId = storageKey.split("/")[1];
  if (!missionId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    select: { clientId: true, lawyerId: true },
  });

  if (!mission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isParticipant =
    mission.clientId === session.user.id || mission.lawyerId === session.user.id;
  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const buffer = await storage.read(storageKey);
    const message = await prisma.message.findFirst({
      where: { attachmentUrl: { contains: storageKey } },
      select: { attachmentMime: true, attachmentName: true },
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": message?.attachmentMime ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${message?.attachmentName ?? "piece-jointe"}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
