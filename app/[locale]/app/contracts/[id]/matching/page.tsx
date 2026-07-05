import { MissionType } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BarristerMatchingList } from "@/components/contracts/barrister-matching";
import { Button } from "@/components/ui/button";
import { requireClientContract } from "@/lib/contracts/access";
import { contractMatchingContext } from "@/lib/contracts/document";
import { matchBarristersForContract } from "@/lib/matching/barristers";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ plan?: string }>;
};

export default async function ContractMatchingPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { plan: planParam } = await searchParams;
  const plan = planParam === "ai-barrister" ? "ai-barrister" : "mission";

  const { contract } = await requireClientContract(id);
  const t = await getTranslations("contracts.matching");

  if (!contractMatchingContext(contract)) notFound();

  const profiles = await matchBarristersForContract(id);
  const barristers = profiles.map((p) => ({
    userId: p.user.id,
    name: p.user.name,
    photoUrl: p.photoUrl,
    barreau: p.barreau,
    city: p.city,
    specialties: p.specialties,
    validationPriceCents: p.validationPriceCents,
    responseTimeHours: p.responseTimeHours,
    rating: p.rating,
    ratingCount: p.ratingCount,
    score: 0,
  }));

  const missionType = MissionType.RELECTURE;

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href={`/app/contracts/${id}`}>{t("back")}</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <BarristerMatchingList
        contractId={id}
        barristers={barristers}
        plan={plan}
        missionType={missionType}
      />
    </div>
  );
}
