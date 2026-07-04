"use client";

import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  contractId: string;
};

export function TriageRunner({ contractId }: Props) {
  const t = useTranslations("contracts.triage");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch(`/api/contracts/${contractId}/analyze`, { method: "POST" });
        const data = (await res.json()) as { error?: string };

        if (cancelled) return;

        if (!res.ok) {
          if (data.error === "ANTHROPIC_NOT_CONFIGURED") {
            setError("anthropicNotConfigured");
            return;
          }
          setError("failed");
          return;
        }

        router.refresh();
      } catch {
        if (!cancelled) setError("failed");
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [contractId, router]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t("errorTitle")}</AlertTitle>
        <AlertDescription>{t(`errors.${error}`)}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      <div>
        <p className="font-medium">{t("analyzingTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("analyzingDescription")}</p>
      </div>
    </div>
  );
}
