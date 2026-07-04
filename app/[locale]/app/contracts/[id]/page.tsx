import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { TriageResultView } from "@/components/contracts/triage-result";
import { TriageRunner } from "@/components/contracts/triage-runner";
import { auth } from "@/lib/auth";
import { getContractForClient } from "@/lib/contracts/access";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return { title: "Contrat" };

  const contract = await getContractForClient(id, session.user.id);
  return { title: contract?.title ?? "Contrat" };
}

export default async function ContractTriagePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const t = await getTranslations("contracts.triage");

  if (!session?.user?.id || session.user.role !== "CLIENT") notFound();

  const contract = await getContractForClient(id, session.user.id);
  if (!contract) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/app"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        {t("backToDashboard")}
      </Link>

      {contract.analysis ? (
        <TriageResultView analysis={contract.analysis} contractTitle={contract.title} />
      ) : (
        <TriageRunner contractId={contract.id} />
      )}
    </div>
  );
}
