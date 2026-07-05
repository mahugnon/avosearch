"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateBarristerContractAction } from "@/lib/actions/barrister-contract";
import { HighlightedContractBody } from "@/components/contracts/highlighted-contract-body";
import { ContractDocumentFromBody } from "@/components/contracts/contract-document";
import {
  BarristerFieldReviewHeader,
  BarristerFieldReviewSidebar,
} from "@/components/barrister/barrister-field-review-sidebar";
import {
  FIELD_PILL_HEIGHT,
  useFieldAnchorPositions,
} from "@/components/barrister/use-field-anchor-positions";
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

  const filledFieldIds = useMemo(() => filledFields.map((field) => field.id), [filledFields]);

  const validatedCount = filledFields.filter((field) => validatedIds.has(field.id)).length;

  const { lineGroups, trackHeight } = useFieldAnchorPositions(trackRef, filledFieldIds, [
    validatedIds,
    focusedFieldId,
    previewSegments,
  ]);

  function handleValidate(fieldId: string) {
    setValidatedIds((prev) => new Set(prev).add(fieldId));
    setFocusedFieldId(fieldId);
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
        <div className="rounded-2xl border bg-neutral-100/60">
          {showSidebar && activeHighlight && (
            <div className="border-b p-3 lg:hidden">
              <BarristerFieldReviewSidebar
                fields={activeHighlight.fields}
                answers={activeHighlight.answers}
                validatedIds={validatedIds}
                onValidate={handleValidate}
                onFieldFocus={handleFieldFocus}
                focusedFieldId={focusedFieldId}
              />
            </div>
          )}

          {showSidebar && (
            <div className="hidden border-b border-border/60 bg-card/80 px-3 py-2 sm:px-5 lg:grid lg:grid-cols-[minmax(0,1fr)_1.25rem_13rem] lg:items-end lg:gap-0">
              <div />
              <div />
              <BarristerFieldReviewHeader
                validatedCount={validatedCount}
                totalCount={filledFields.length}
              />
            </div>
          )}

          <div className="overflow-x-auto px-3 py-5 sm:px-5 sm:py-6">
            <div
              ref={trackRef}
              className="relative grid min-w-0 items-start lg:grid-cols-[minmax(0,1fr)_1.25rem_13rem]"
            >
              <div className="min-w-0">
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

              {showSidebar && (
                <div
                  className="relative hidden lg:block"
                  style={{ minHeight: trackHeight > 0 ? trackHeight : undefined }}
                >
                  {lineGroups.map((group) => (
                    <div
                      key={group.fieldIds.join("-")}
                      className="pointer-events-none absolute inset-x-0 border-t border-amber-300/70"
                      style={{ top: group.top + FIELD_PILL_HEIGHT / 2 }}
                      aria-hidden
                    />
                  ))}
                </div>
              )}

              {showSidebar && activeHighlight && (
                <div className="hidden lg:block">
                  <BarristerFieldReviewSidebar
                    fields={activeHighlight.fields}
                    answers={activeHighlight.answers}
                    validatedIds={validatedIds}
                    onValidate={handleValidate}
                    onFieldFocus={handleFieldFocus}
                    focusedFieldId={focusedFieldId}
                    lineGroups={lineGroups}
                    trackHeight={trackHeight}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
