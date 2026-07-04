import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type ClientSessionResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "unauthorized" | "sessionExpired" };

export async function getClientSession(): Promise<ClientSessionResult> {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "CLIENT") {
    return { ok: false, reason: "unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });

  if (!user) {
    return { ok: false, reason: "sessionExpired" };
  }

  return { ok: true, userId: user.id };
}
