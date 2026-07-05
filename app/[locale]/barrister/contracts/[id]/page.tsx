import { MissionStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BarristerContractEditor } from "@/components/barrister/barrister-contract-editor";
import { Button } from "@/components/ui/button";
import { requireBarristerContractReview } from "@/lib/contracts/barrister-access";
import { loadBarristerContractHighlight } from "@/lib/actions/barrister-contract";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { contract } = await requireBarristerContractReview(id);
  return { title: contract.title };
}

export default async function BarristerContractReviewPage({ params }: Props) {
  const { id } = await params;
  const { contract, session } = await requireBarristerContractReview(id);
  const t = await getTranslations("barrister.review");
  const tm = await getTranslations("barrister.mission");

  const mission = await prisma.mission.findFirst({
    where: {
      contractId: id,
      barristerId: session.user.id,
      status: { in: [MissionStatus.ACCEPTEE, MissionStatus.EN_COURS] },
    },
    select: { id: true },
  });

  const highlight = await loadBarristerContractHighlight(contract);

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/barrister/missions">{t("backToMissions")}</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{contract.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("clientLabel", { name: contract.owner.name })}
        </p>
        {contract.userQuestion && (
          <p className="mt-1 text-sm text-muted-foreground">{contract.userQuestion}</p>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{t("intro")}</p>

      {contract.extractedText.trim() && (
        <BarristerContractEditor
          contractId={contract.id}
          missionId={mission?.id}
          title={tm("contractText")}
          extractedText={contract.extractedText}
          highlight={highlight}
        />
      )}
    </div>
  );
}
