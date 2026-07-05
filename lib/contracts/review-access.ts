import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { prisma } from "@/lib/db";
import { canGenerateContractReview, canViewContractReview, isAdmin } from "@/lib/auth/roles";
import { findBarristerMissionForContract } from "@/lib/missions/access";

export async function authorizeContractReviewAccess(
  session: Session | null,
  contractId: string,
  mode: "read" | "generate"
) {
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { analysis: { include: { modifications: true } } },
  });

  if (!contract?.analysis) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (mode === "generate") {
    if (!canGenerateContractReview(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const mission = await findBarristerMissionForContract(contractId, session.user.id);
    if (!mission) {
      return NextResponse.json({ error: "NO_MISSION" }, { status: 403 });
    }

    return { contract, mission };
  }

  if (!canViewContractReview(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (session.user.role === "CLIENT") {
    if (contract.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return { contract };
  }

  const mission = await findBarristerMissionForContract(contractId, session.user.id);
  if (!mission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return { contract, mission };
}
