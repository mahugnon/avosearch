import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeContract } from "@/lib/ai/triage";
import { assertClientSession, getContractForClient } from "@/lib/contracts/access";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const userId = assertClientSession(session);
    const { id } = await context.params;

    const contract = await getContractForClient(id, userId);
    if (!contract) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    if (contract.analysis) {
      return NextResponse.json({ analysis: contract.analysis, alreadyAnalyzed: true });
    }

    const analysis = await analyzeContract(id);
    return NextResponse.json({ analysis, alreadyAnalyzed: false });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "ANTHROPIC_NOT_CONFIGURED") {
      return NextResponse.json({ error: "ANTHROPIC_NOT_CONFIGURED" }, { status: 503 });
    }
    console.error("[analyze]", error);
    return NextResponse.json({ error: "ANALYSIS_FAILED" }, { status: 500 });
  }
}
