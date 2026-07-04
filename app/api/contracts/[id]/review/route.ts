import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runContractReview, ReviewError } from "@/lib/ai/review";
import { authorizeContractReviewAccess } from "@/lib/contracts/review-access";
import { prisma } from "@/lib/db";
import type { RiskLevel } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();
  const { id } = await context.params;

  const authResult = await authorizeContractReviewAccess(session, id, "generate");
  if (authResult instanceof NextResponse) return authResult;

  const { contract } = authResult;

  if (contract.analysis!.modifications.length > 0) {
    return NextResponse.json({
      modifications: contract.analysis!.modifications.map((m) => ({
        id: m.id,
        order: m.order,
        originalExcerpt: m.originalExcerpt,
        proposedText: m.proposedText,
        rationale: m.rationale,
        riskLevel: m.riskLevel,
        status: m.status,
      })),
    });
  }

  try {
    const { result, model } = await runContractReview({
      extractedText: contract.extractedText,
      userQuestion: contract.userQuestion,
      flags: contract.analysis!.flags,
    });

    const modifications = await prisma.$transaction(async (tx) => {
      await tx.modification.deleteMany({ where: { analysisId: contract.analysis!.id } });
      const created = [];
      for (const mod of result.modifications) {
        const row = await tx.modification.create({
          data: {
            analysisId: contract.analysis!.id,
            order: mod.order,
            originalExcerpt: mod.original_excerpt,
            proposedText: mod.proposed_text,
            rationale: mod.rationale,
            riskLevel: mod.risk_level as RiskLevel,
          },
        });
        created.push(row);
      }
      await tx.analysis.update({
        where: { id: contract.analysis!.id },
        data: { model: `${contract.analysis!.model}+review:${model}` },
      });
      return created;
    });

    return NextResponse.json({
      modifications: modifications.map((m) => ({
        id: m.id,
        order: m.order,
        originalExcerpt: m.originalExcerpt,
        proposedText: m.proposedText,
        rationale: m.rationale,
        riskLevel: m.riskLevel,
        status: m.status,
      })),
      demoMode: model === "demo-heuristic",
    });
  } catch (error) {
    if (error instanceof ReviewError) {
      return NextResponse.json({ error: error.code }, { status: 502 });
    }
    console.error("[review]", error);
    return NextResponse.json({ error: "REVIEW_FAILED" }, { status: 500 });
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  const { id } = await context.params;

  const authResult = await authorizeContractReviewAccess(session, id, "read");
  if (authResult instanceof NextResponse) return authResult;

  const { contract } = authResult;

  return NextResponse.json({
    aiConsentAt: contract.aiConsentAt,
    modifications: contract.analysis!.modifications,
  });
}
