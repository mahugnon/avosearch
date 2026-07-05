import { MissionStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LawyerContractEditor } from "@/components/lawyer/lawyer-contract-editor";
import { Button } from "@/components/ui/button";
import { requireLawyerContractReview } from "@/lib/contracts/lawyer-access";
import { loadLawyerContractHighlight } from "@/lib/actions/lawyer-contract";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { contract } = await requireLawyerContractReview(id);
  return { title: contract.title };
}

export default async function LawyerContractReviewPage({ params }: Props) {
  const { id } = await params;
  const { contract, session } = await requireLawyerContractReview(id);
  const t = await getTranslations("lawyer.review");
  const tm = await getTranslations("lawyer.mission");

  const mission = await prisma.mission.findFirst({
    where: {
      contractId: id,
      lawyerId: session.user.id,
      status: { in: [MissionStatus.ACCEPTEE, MissionStatus.EN_COURS] },
    },
    select: { id: true },
  });

  const highlight = await loadLawyerContractHighlight(contract);

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/lawyer/missions">{t("backToMissions")}</Link>
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
        <LawyerContractEditor
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
