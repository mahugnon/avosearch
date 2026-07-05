import { MissionStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ContractViewer } from "@/components/contracts/contract-viewer";
import { BarristerReviewedBy } from "@/components/contracts/barrister-reviewed-by";
import { ReviewPanel } from "@/components/contracts/review-panel";
import { MissionChat } from "@/components/missions/mission-chat";
import { MissionReviewForm } from "@/components/missions/mission-review-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatEuros } from "@/lib/config";
import { isBarristerReviewDelivered } from "@/lib/contracts/barrister-review";
import type { ContractReviewBarrister } from "@/lib/contracts/barrister-review";
import { getLocale } from "next-intl/server";
import type { AppLocale } from "@/lib/i18n";
import { notFound, redirect } from "next/navigation";
import { localizedPath } from "@/lib/i18n";
import { payMissionAction } from "@/lib/actions/payments";

type Props = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ paid?: string; cancel?: string }>;
};

export default async function ClientMissionPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { paid, cancel } = await searchParams;
  const session = await auth();
  const t = await getTranslations("missions");
  const tc = await getTranslations("contracts");
  const to = await getTranslations("client.orders");
  const locale = (await getLocale()) as AppLocale;

  if (!session || session.user.role !== "CLIENT") {
    redirect(localizedPath("/login", locale));
  }

  const mission = await prisma.mission.findFirst({
    where: { id, clientId: session.user.id },
    include: {
      contract: { include: { analysis: { include: { modifications: { orderBy: { order: "asc" } } } } } },
      barrister: {
        include: { barristerProfile: true },
      },
      messages: {
        include: { sender: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      review: true,
    },
  });

  if (!mission) notFound();

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

  const barristerReviewed = isBarristerReviewDelivered(mission.status);
  const hasContractText = mission.contract.extractedText.trim().length > 0;

  const reviewBarrister: ContractReviewBarrister | null =
    barristerReviewed && mission.barrister?.barristerProfile
      ? {
          userId: mission.barrister.id,
          name: mission.barrister.name,
          photoUrl: mission.barrister.barristerProfile.photoUrl,
          barreau: mission.barrister.barristerProfile.barreau,
          city: mission.barrister.barristerProfile.city,
          specialties: mission.barrister.barristerProfile.specialties,
          bio: mission.barrister.barristerProfile.bio,
          validationPriceCents: mission.barrister.barristerProfile.validationPriceCents,
          responseTimeHours: mission.barrister.barristerProfile.responseTimeHours,
          rating: mission.barrister.barristerProfile.rating,
          ratingCount: mission.barrister.barristerProfile.ratingCount,
        }
      : null;

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/app/orders">{to("back")}</Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{mission.contract.title}</h1>
          <Badge variant="outline">{t(`status.${mission.status}`)}</Badge>
          {reviewBarrister && <BarristerReviewedBy barrister={reviewBarrister} locale={locale} size="md" />}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("barrister")}: {mission.barrister?.name ?? "—"} ·{" "}
          {mission.finalPriceCents != null
            ? t("finalPrice", { price: formatEuros(mission.finalPriceCents, locale) })
            : t("estimatedPrice", { price: formatEuros(mission.priceCents, locale) })}
        </p>
        {hasContractText && (
          <p className="mt-2">
            <Button asChild variant="link" size="sm" className="h-auto px-0">
              <Link href={`/app/contracts/${mission.contractId}`}>{t("openContract")}</Link>
            </Button>
          </p>
        )}
        {mission.autoAssigned && (
          <p className="mt-1 text-xs text-muted-foreground">{t("autoAssigned")}</p>
        )}
      </div>

      {mission.status === MissionStatus.PROPOSEE && (
        <div className="rounded-xl border p-4 space-y-3">
          <p className="text-sm">{t("paymentPending")}</p>
          <form action={payMissionAction.bind(null, mission.id)}>
            <Button type="submit">{t("pay")}</Button>
          </form>
          {cancel && <p className="text-sm text-muted-foreground">{t("paymentCancelled")}</p>}
        </div>
      )}

      {paid && mission.status !== MissionStatus.PROPOSEE && (
        <p className="text-sm text-emerald-700">{t("paymentSuccess")}</p>
      )}

      {hasContractText && (
        <ContractViewer
          title={t("contractDocument")}
          body={mission.contract.extractedText}
          contractId={mission.contractId}
        />
      )}

      {modifications.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t("modificationsTitle")}</h2>
          <ReviewPanel contractId={mission.contractId} modifications={modifications} readOnly={false} />
        </section>
      )}

      {mission.globalNote && (
        <div className="rounded-xl bg-muted p-4 text-sm">
          <p className="font-medium">{t("barristerDelivery")}</p>
          <p className="mt-2 whitespace-pre-wrap">{mission.globalNote}</p>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("chatTitle")}</h2>
        <MissionChat
          missionId={mission.id}
          initialMessages={mission.messages}
          currentUserId={session.user.id}
          allowAttachments={!!mission.contract.fileUrl}
        />
      </section>

      {mission.status === MissionStatus.LIVREE && !mission.review && (
        <MissionReviewForm missionId={mission.id} />
      )}
    </div>
  );
}
