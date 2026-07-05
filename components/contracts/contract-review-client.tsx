"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { AiConsentForm } from "@/components/contracts/ai-consent-form";
import { ReviewPanel, type ModificationView } from "@/components/contracts/review-panel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { formatEuros, pricing } from "@/lib/config";
import type { AppLocale } from "@/lib/i18n";
import { useLocale } from "next-intl";

type Props = {
  contractId: string;
  plan: "ai-only" | "ai-barrister";
  aiConsentAt: Date | null;
  initialModifications: ModificationView[];
};

export function ContractReviewClient({
  contractId,
  plan,
  aiConsentAt,
  initialModifications,
}: Props) {
  const t = useTranslations("contracts.review");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [consented, setConsented] = useState(Boolean(aiConsentAt));
  const [modifications, setModifications] = useState(initialModifications);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(() => router.refresh(), [router]);

  async function runReview() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/contracts/${contractId}/review`, { method: "POST" });
      const data = (await res.json()) as { modifications?: ModificationView[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "REVIEW_FAILED");
        return;
      }
      setModifications(data.modifications ?? []);
      refresh();
    } catch {
      setError("NETWORK_ERROR");
    } finally {
      setLoading(false);
    }
  }

  const price =
    plan === "ai-barrister" ? pricing.aiPlusBarristerCents : pricing.aiOnlyCents;

  if (!consented) {
    return (
      <AiConsentForm
        contractId={contractId}
        onConsented={() => {
          setConsented(true);
          refresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{t("planLabel")}</p>
          <p className="text-lg font-semibold">
            {plan === "ai-barrister" ? t("planAiBarrister") : t("planAiOnly")} —{" "}
            {formatEuros(price, locale)}
          </p>
        </div>
        {modifications.length === 0 && (
          <Button type="button" onClick={() => void runReview()} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("generating")}
              </>
            ) : (
              t("generate")
            )}
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{t(`errors.${error}` as "errors.REVIEW_FAILED")}</AlertDescription>
        </Alert>
      )}

      <ReviewPanel
        contractId={contractId}
        modifications={modifications}
        onRefresh={refresh}
      />

      {modifications.length > 0 && (
        <div className="flex flex-wrap gap-3 border-t pt-4">
          {plan === "ai-barrister" ? (
            <Button asChild>
              <Link href={`/app/contracts/${contractId}/matching?plan=ai-barrister`}>
                {t("continueMatching")}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href={`/app/contracts/${contractId}`}>{t("backToContract")}</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
