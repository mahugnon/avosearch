"use client";

import { Loader2, Scale } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import {
  confirmLawyerMissionAction,
  getLawyerSelectionAction,
} from "@/lib/actions/missions";
import type { LawyerMatchView } from "@/lib/matching/lawyer-view";
import { LawyerProfileCard } from "@/components/lawyer/lawyer-profile-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatEuros } from "@/lib/config";
import type { AppLocale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";

type Props = {
  contractId: string;
  variant?: "default" | "primary";
};

type Step = "idle" | "searching" | "results" | "error";

const SEARCH_MIN_MS = 1200;

export function LawyerSelectionDialog({ contractId, variant = "primary" }: Props) {
  const t = useTranslations("contracts.lawyerSelection");
  const tViewer = useTranslations("chat.viewer");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [lawyers, setLawyers] = useState<LawyerMatchView[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [priceCents, setPriceCents] = useState<number | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const loadSelection = useCallback(async () => {
    setStep("searching");
    setErrorKey(null);

    const [result] = await Promise.all([
      getLawyerSelectionAction(contractId),
      new Promise((resolve) => setTimeout(resolve, SEARCH_MIN_MS)),
    ]);

    if ("existingMissionId" in result && result.existingMissionId) {
      router.push(localizedPath(`/app/missions/${result.existingMissionId}`, locale));
      setOpen(false);
      return;
    }

    if ("error" in result) {
      setErrorKey(typeof result.error === "string" ? result.error : "generic");
      setStep("error");
      return;
    }

    if (!("ok" in result) || !result.ok) {
      setErrorKey("generic");
      setStep("error");
      return;
    }

    setLawyers(result.lawyers);
    setSelectedId(result.selectedLawyerId);
    setPriceCents(result.priceCents);
    setStep("results");
  }, [contractId, locale, router]);

  function handleOpen() {
    setOpen(true);
    void loadSelection();
  }

  function handleConfirm() {
    if (!selectedId) return;
    startTransition(() => {
      void confirmLawyerMissionAction(contractId, selectedId);
    });
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen && !pending) {
      setStep("idle");
      setLawyers([]);
      setSelectedId(null);
      setPriceCents(null);
      setErrorKey(null);
    }
    setOpen(nextOpen);
  }

  const selectedLawyer = lawyers.find((l) => l.userId === selectedId);
  const otherLawyers = lawyers.filter((l) => l.userId !== selectedId);

  return (
    <>
      <Button
        type="button"
        variant={variant === "primary" ? "default" : "outline"}
        size="sm"
        className="h-8 gap-1.5"
        disabled={pending || (open && step === "searching")}
        onClick={handleOpen}
      >
        <Scale className="size-3.5" />
        {pending ? tViewer("requestLawyerPending") : tViewer("requestLawyer")}
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" showCloseButton={!pending}>
          <DialogHeader>
            <DialogTitle>
              {step === "searching" ? t("searchingTitle") : t("title")}
            </DialogTitle>
            <DialogDescription>
              {step === "searching" ? t("searchingDescription") : t("description")}
            </DialogDescription>
          </DialogHeader>

          {step === "searching" && (
            <div className="flex flex-col items-center gap-4 py-10">
              <Loader2 className="size-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t("searchingHint")}</p>
            </div>
          )}

          {step === "error" && (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t(`errors.${errorKey ?? "generic"}` as "errors.generic")}
              </p>
            </div>
          )}

          {step === "results" && selectedLawyer && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("selectedLabel")}
                </p>
                <LawyerProfileCard
                  lawyer={selectedLawyer}
                  locale={locale}
                  selected
                  showMatchReason
                  priceCents={priceCents ?? undefined}
                />
              </div>

              {otherLawyers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("changeLabel")}
                  </p>
                  <ul className="space-y-2">
                    {otherLawyers.map((lawyer) => (
                      <li key={lawyer.userId}>
                        <LawyerProfileCard
                          lawyer={lawyer}
                          locale={locale}
                          selected={false}
                          onSelect={() => setSelectedId(lawyer.userId)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {step === "results" && (
            <DialogFooter className="sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {priceCents != null && t("confirmPrice", { price: formatEuros(priceCents, locale) })}
              </p>
              <Button type="button" disabled={pending || !selectedId} onClick={handleConfirm}>
                {pending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {t("confirming")}
                  </>
                ) : (
                  t("confirmAndPay")
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
