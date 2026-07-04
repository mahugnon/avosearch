import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runContractTriage, TriageError } from "@/lib/ai/triage";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { analysis: true },
  });

  if (!contract || contract.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { result, model } = await runContractTriage({
      extractedText: contract.extractedText,
      userQuestion: contract.userQuestion,
    });

    if (result.outOfScope) {
      if (contract.analysis) {
        await prisma.analysis.delete({ where: { contractId: contract.id } });
      }
      return NextResponse.json({
        outOfScope: true,
        domain: result.domain,
        justification: result.justification,
        requiredPro: result.requiredPro,
      });
    }

    const analysis = await prisma.$transaction(async (tx) => {
      if (contract.analysis) {
        await tx.analysis.delete({ where: { contractId: contract.id } });
      }
      return tx.analysis.create({
        data: {
          contractId: contract.id,
          triage: result.triage,
          confidence: result.confidence,
          domain: result.domain,
          justification: result.justification,
          flags: result.flags,
          requiredPro: result.requiredPro,
          model,
        },
      });
    });

    return NextResponse.json({
      outOfScope: false,
      analysis: {
        id: analysis.id,
        triage: analysis.triage,
        confidence: analysis.confidence,
        domain: analysis.domain,
        justification: analysis.justification,
        flags: analysis.flags,
        requiredPro: analysis.requiredPro,
        guardrailNotes: result.guardrailNotes,
        demoMode: model === "demo-heuristic",
      },
    });
  } catch (error) {
    if (error instanceof TriageError) {
      const status = error.code === "AI_NOT_CONFIGURED" ? 503 : 502;
      return NextResponse.json({ error: error.code, message: error.message }, { status });
    }
    console.error("[analyze]", error);
    return NextResponse.json({ error: "ANALYZE_FAILED" }, { status: 500 });
  }
}
