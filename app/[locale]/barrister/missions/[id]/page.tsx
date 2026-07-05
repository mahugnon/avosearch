import { MissionStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BarristerMissionReview } from "@/components/barrister/barrister-mission-review";
import { BarristerContractEditor } from "@/components/barrister/barrister-contract-editor";
import { ContractViewer } from "@/components/contracts/contract-viewer";
import { BarristerReviewedBadge } from "@/components/contracts/barrister-reviewed-badge";
import { MissionWorkTimer } from "@/components/barrister/mission-work-timer";
import { MissionChat } from "@/components/missions/mission-chat";
import { barristerAcceptMissionAction } from "@/lib/actions/missions";
import { loadBarristerContractHighlight } from "@/lib/actions/barrister-contract";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { localizedPath } from "@/lib/i18n";
import { isBarristerReviewDelivered } from "@/lib/contracts/barrister-review";
import { getLocale } from "next-intl/server";
import type { AppLocale } from "@/lib/i18n";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function BarristerMissionDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const t = await getTranslations("barrister.mission");
  const tc = await getTranslations("contracts");
  const locale = (await getLocale()) as AppLocale;

  if (!session || session.user.role !== "BARRISTER") {
    redirect(localizedPath("/login", locale));
  }

  const mission = await prisma.mission.findFirst({
    where: { id, barristerId: session.user.id },
    include: {
      contract: {
        include: {
          template: true,
          analysis: { include: { modifications: { orderBy: { order: "asc" } } } },
        },
      },
      client: { select: { name: true } },
      messages: {
        include: { sender: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!mission) notFound();

  const barristerReviewed = isBarristerReviewDelivered(mission.status);
  const contractHighlight = await loadBarristerContractHighlight(mission.contract);

  const modifications =
    mission.contract.analysis?.modifications.map((m) => ({
      id: m.id,
      order: m.order,
      originalExcerpt: m.originalExcerpt,
      proposedText: m.proposedText,
      rationale: m.rationale,
      riskLevel: m.riskLevel,
      status: m.status,
      amendedText: m.amendedText,
      barristerComment: m.barristerComment,
    })) ?? [];

  async function acceptMission() {
    "use server";
    await barristerAcceptMissionAction(id);
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/barrister/missions" className="text-sm text-muted-foreground hover:text-foreground">
          {t("back")}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{mission.contract.title}</h1>
          <Badge variant="outline">{t(`status.${mission.status}`)}</Badge>
          {barristerReviewed && <BarristerReviewedBadge label={tc("barristerReviewed")} />}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t("client")}: {mission.client.name}</p>
        {mission.autoAssigned && (
          <p className="mt-1 text-xs text-muted-foreground">{t("autoAssigned")}</p>
        )}
      </div>

      {mission.status === MissionStatus.ACCEPTEE && (
        <form action={acceptMission}>
          <Button type="submit">{t("start")}</Button>
        </form>
      )}

      {mission.status === MissionStatus.EN_COURS && (
        <>
          <MissionWorkTimer
            workStartedAt={mission.workStartedAt?.toISOString() ?? null}
            storedSeconds={mission.workDurationSeconds}
            hourlyRateCents={mission.hourlyRateCents ?? 15000}
            minimumCents={mission.priceCents}
          />
          {mission.contract.extractedText.trim() && (
            <BarristerContractEditor
              contractId={mission.contractId}
              missionId={mission.id}
              title={t("contractText")}
              extractedText={mission.contract.extractedText}
              highlight={contractHighlight}
            />
          )}
          <BarristerMissionReview
            missionId={mission.id}
            modifications={modifications}
          />
        </>
      )}

      {(mission.status === MissionStatus.LIVREE || mission.status === MissionStatus.TERMINEE) && (
        <>
          {mission.globalNote && (
            <p className="rounded-xl bg-muted p-4 text-sm whitespace-pre-wrap">{mission.globalNote}</p>
          )}
          {mission.contract.extractedText.trim() && (
            <ContractViewer
              title={t("deliveredContract")}
              body={mission.contract.extractedText}
              contractId={mission.contractId}
              mode="barrister"
              canDownload
            />
          )}
        </>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("chatTitle")}</h2>
        <MissionChat
          missionId={mission.id}
          initialMessages={mission.messages}
          currentUserId={session.user.id}
        />
      </section>
    </div>
  );
}
