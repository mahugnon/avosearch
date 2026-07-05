"use server";

import { MissionStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { renderTemplateBody } from "@/lib/templates/render";
import { loadTemplateBody } from "@/lib/templates/load";
import {
  getContractHighlightData,
  highlightFromRenderedContract,
} from "@/lib/templates/highlight";
import type { ContractHighlightData } from "@/lib/templates/highlight";

export type BarristerContractUpdateResult = { ok: true } | { error: string };

async function assertBarristerMissionAccess(contractId: string, missionId?: string) {
  const session = await auth();
  if (!session || session.user.role !== "BARRISTER") {
    return { error: "unauthorized" as const };
  }

  const mission = missionId
    ? await prisma.mission.findFirst({
        where: {
          id: missionId,
          contractId,
          barristerId: session.user.id,
          status: { in: [MissionStatus.ACCEPTEE, MissionStatus.EN_COURS] },
        },
        select: { id: true },
      })
    : await prisma.mission.findFirst({
        where: {
          contractId,
          barristerId: session.user.id,
          status: { in: [MissionStatus.ACCEPTEE, MissionStatus.EN_COURS] },
        },
        select: { id: true },
      });

  if (!mission) return { error: "forbidden" as const };
  return { ok: true as const };
}

export async function updateBarristerContractAction(input: {
  contractId: string;
  missionId?: string;
  extractedText: string;
  draftAnswers?: Record<string, string>;
}): Promise<BarristerContractUpdateResult> {
  const access = await assertBarristerMissionAccess(input.contractId, input.missionId);
  if (!("ok" in access)) {
    return { error: access.error };
  }

  const text = input.extractedText.trim();
  if (!text) return { error: "empty" };

  const contract = await prisma.contract.findUnique({
    where: { id: input.contractId },
    include: { template: true },
  });
  if (!contract) return { error: "not_found" };

  let extractedText = text;
  const draftAnswers = input.draftAnswers;

  if (draftAnswers && contract.template) {
    try {
      const templateBody = await loadTemplateBody(contract.template);
      extractedText = renderTemplateBody(templateBody, draftAnswers);
    } catch {
      // Keep client-provided extractedText if template cannot be loaded.
    }
  }

  await prisma.contract.update({
    where: { id: input.contractId },
    data: {
      extractedText,
      ...(draftAnswers ? { draftAnswers } : {}),
    },
  });

  return { ok: true };
}

export async function loadBarristerContractHighlight(contract: {
  template: {
    fileKey: string | null;
    fileName: string | null;
    mimeType: string | null;
    placeholders: string[];
  } | null;
  draftAnswers: unknown;
  extractedText: string;
}): Promise<ContractHighlightData | null> {
  if (contract.extractedText.trim()) {
    const fromRendered = highlightFromRenderedContract({
      extractedText: contract.extractedText,
      draftAnswers: contract.draftAnswers,
    });
    if (fromRendered) return fromRendered;
  }

  if (contract.template) {
    try {
      const templateBody = await loadTemplateBody(contract.template);
      return getContractHighlightData({
        templateBody,
        draftAnswers: contract.draftAnswers,
      });
    } catch {
      return null;
    }
  }

  return null;
}
