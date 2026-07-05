"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateBarristerContractAction } from "@/lib/actions/barrister-contract";
import { HighlightedContractBody } from "@/components/contracts/highlighted-contract-body";
import { ContractDocumentFromBody } from "@/components/contracts/contract-document";
import { BarristerFieldReviewSidebar } from "@/components/barrister/barrister-field-review-sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  buildContractSegments,
  highlightFromRenderedContract,
  type ContractHighlightData,
} from "@/lib/templates/highlight";

type Props = {
  contractId: string;
  missionId?: string;
  title: string;
  extractedText: string;
  highlight: ContractHighlightData | null;
};

export function BarristerContractEditor({
  contractId,
  missionId,
  title,
  extractedText,
  highlight,
}: Props) {
  const t = useTranslations("barrister.mission");
  const tc = useTranslations("contracts.viewer");
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const [pending, startTransition] = useTransition();
  const [validatedIds, setValidatedIds] = useState<Set<string>>(new Set());
  const [focusedFieldId, setFocusedFieldId] = useState<string | null>(null);
  const [fullEdit, setFullEdit] = useState(false);
  const [fullText, setFullText] = useState(extractedText);
  const [saved, setSaved] = useState(false);

  const activeHighlight = useMemo((): ContractHighlightData | null => {
    if (!highlight) return null;

    return (
      highlightFromRenderedContract({
        extractedText,
        draftAnswers: highlight.answers,
      }) ?? { ...highlight, segments: highlight.segments }
    );
  }, [highlight, extractedText]);

  const previewSegments = useMemo(() => {
    if (!activeHighlight) return null;
    return (
      activeHighlight.segments ??
      buildContractSegments(
        activeHighlight.templateBody,
        activeHighlight.answers,
        activeHighlight.fields
      )
    );
  }, [activeHighlight]);

  const filledFields = useMemo(
    () => activeHighlight?.fields.filter((field) => activeHighlight.answers[field.id]?.trim()) ?? [],
    [activeHighlight]
  );

  function handleValidate(fieldId: string) {
    setValidatedIds((prev) => new Set(prev).add(fieldId));
    setFocusedFieldId(fieldId);
  }

  function handleValidateAll() {
    setValidatedIds(new Set(filledFields.map((field) => field.id)));
  }

  function handleFieldFocus(fieldId: string) {
    setFocusedFieldId(fieldId);
    trackRef.current
      ?.querySelector(`[data-field-id="${fieldId}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleSave() {
    startTransition(async () => {
      const nextExtracted = fullText.trim();
      const result = await updateBarristerContractAction({
        contractId,
        missionId,
        extractedText: nextExtracted,
      });

      if ("error" in result) return;

      setSaved(true);
      setFullEdit(false);
      router.refresh();
    });
  }

  if (!extractedText.trim()) return null;

  const showSidebar = Boolean(filledFields.length && !fullEdit);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{t("contractEditHint")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFullEdit((value) => !value)}
          >
            {fullEdit ? t("structuredEdit") : t("fullEdit")}
          </Button>
          {fullEdit && (
            <Button type="button" size="sm" disabled={pending} onClick={handleSave}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("savingContract")}
                </>
              ) : (
                t("saveContract")
              )}
            </Button>
          )}
        </div>
      </div>

      {saved && (
        <p className="rounded-lg border border-emerald-400/40 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {t("contractSaved")}
        </p>
      )}

      {fullEdit ? (
        <Textarea
          value={fullText}
          onChange={(e) => {
            setFullText(e.target.value);
            setSaved(false);
          }}
          rows={18}
          className="font-mono text-sm leading-relaxed"
        />
      ) : (
        <div
          ref={trackRef}
          className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]"
        >
          <div className="min-w-0 overflow-x-auto rounded-2xl border bg-neutral-100/60 px-3 py-5 sm:px-5 sm:py-6">
            {activeHighlight && previewSegments ? (
              <HighlightedContractBody
                highlight={{
                  ...activeHighlight,
                  segments: previewSegments,
                }}
                mode="barrister"
                validatedIds={validatedIds}
                onValidate={handleValidate}
                focusedFieldId={focusedFieldId}
                inlineFieldActions={false}
                showLegend={false}
              />
            ) : (
              <>
                <ContractDocumentFromBody body={extractedText} mode="barrister" />
                <p className="mt-3 font-sans text-xs text-muted-foreground">{tc("noHighlights")}</p>
              </>
            )}
          </div>

          {showSidebar && activeHighlight && (
            <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)]">
              <BarristerFieldReviewSidebar
                fields={activeHighlight.fields}
                answers={activeHighlight.answers}
                validatedIds={validatedIds}
                onValidate={handleValidate}
                onValidateAll={handleValidateAll}
                onFieldFocus={handleFieldFocus}
                focusedFieldId={focusedFieldId}
                className="max-h-[calc(100vh-6rem)]"
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
