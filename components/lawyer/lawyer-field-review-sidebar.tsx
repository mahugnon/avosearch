"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { FIELD_PILL_HEIGHT, type FieldLineGroup } from "@/components/lawyer/use-field-anchor-positions";
import type { HighlightField } from "@/lib/templates/highlight";

type Props = {
  fields: HighlightField[];
  answers: Record<string, string>;
  validatedIds: Set<string>;
  onValidate: (fieldId: string) => void;
  onFieldFocus?: (fieldId: string) => void;
  focusedFieldId?: string | null;
  /** Line groups for margin alignment (desktop Word-style). */
  lineGroups?: FieldLineGroup[];
  trackHeight?: number;
  className?: string;
};

function FieldPill({
  field,
  value,
  validated,
  focused,
  onValidate,
  onFieldFocus,
  approveLabel,
  approvedLabel,
}: {
  field: HighlightField;
  value: string;
  validated: boolean;
  focused?: boolean;
  onValidate: () => void;
  onFieldFocus?: () => void;
  approveLabel: string;
  approvedLabel: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-full border px-1.5 transition-colors",
        "max-w-[8.5rem]",
        validated
          ? "border-emerald-200/80 bg-emerald-50/90"
          : "border-amber-200/80 bg-amber-50/80 hover:border-amber-300",
        focused && "z-10 ring-2 ring-primary/35 ring-offset-1"
      )}
      style={{ height: FIELD_PILL_HEIGHT }}
    >
      <button
        type="button"
        className="min-w-0 truncate text-left text-[0.625rem] font-medium leading-none text-foreground"
        onClick={onFieldFocus}
        title={`${field.label}: ${value}`}
      >
        {value}
      </button>

      {validated ? (
        <span
          className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
          aria-label={approvedLabel}
        >
          <Check className="size-2.5" aria-hidden />
        </span>
      ) : (
        <button
          type="button"
          className="inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-amber-300/80 bg-white text-amber-800 transition-colors hover:bg-amber-100"
          onClick={onValidate}
          aria-label={approveLabel}
        >
          <Check className="size-2.5" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function LawyerFieldReviewSidebar({
  fields,
  answers,
  validatedIds,
  onValidate,
  onFieldFocus,
  focusedFieldId,
  lineGroups,
  trackHeight = 0,
  className,
}: Props) {
  const t = useTranslations("lawyer.mission");

  const filledFields = fields.filter((field) => answers[field.id]?.trim());
  const validatedCount = filledFields.filter((field) => validatedIds.has(field.id)).length;
  const marginMode = Boolean(lineGroups);

  if (filledFields.length === 0) return null;

  const fieldById = Object.fromEntries(filledFields.map((field) => [field.id, field]));

  if (marginMode) {
    return (
      <div
        className={cn("relative w-44 shrink-0 lg:w-52", className)}
        style={{ minHeight: trackHeight > 0 ? trackHeight : undefined }}
      >
        {lineGroups?.map((group) => (
          <div
            key={group.fieldIds.join("-")}
            className="absolute inset-x-0 flex flex-wrap items-center gap-1 px-0.5"
            style={{ top: group.top }}
          >
            {group.fieldIds.map((fieldId) => {
              const field = fieldById[fieldId];
              if (!field) return null;

              return (
                <FieldPill
                  key={fieldId}
                  field={field}
                  value={answers[fieldId]?.trim() ?? ""}
                  validated={validatedIds.has(fieldId)}
                  focused={focusedFieldId === fieldId}
                  onValidate={() => onValidate(fieldId)}
                  onFieldFocus={() => onFieldFocus?.(fieldId)}
                  approveLabel={t("approveField")}
                  approvedLabel={t("fieldApproved")}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col rounded-xl border bg-card shadow-sm lg:w-52 lg:shrink-0",
        className
      )}
    >
      <header className="shrink-0 rounded-t-xl border-b px-2 py-1.5">
        <h3 className="text-[0.6875rem] font-semibold">{t("fieldsTitle")}</h3>
        <p className="text-[0.625rem] text-muted-foreground">
          {t("fieldsProgress", { done: validatedCount, total: filledFields.length })}
        </p>
      </header>

      <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-2">
        {filledFields.map((field) => (
          <li key={field.id}>
            <FieldPill
              field={field}
              value={answers[field.id]?.trim() ?? ""}
              validated={validatedIds.has(field.id)}
              focused={focusedFieldId === field.id}
              onValidate={() => onValidate(field.id)}
              onFieldFocus={() => onFieldFocus?.(field.id)}
              approveLabel={t("approveField")}
              approvedLabel={t("fieldApproved")}
            />
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function LawyerFieldReviewHeader({
  validatedCount,
  totalCount,
  className,
}: {
  validatedCount: number;
  totalCount: number;
  className?: string;
}) {
  const t = useTranslations("lawyer.mission");

  return (
    <div className={cn("px-1 py-1", className)}>
      <h3 className="text-[0.6875rem] font-semibold">{t("fieldsTitle")}</h3>
      <p className="text-[0.625rem] text-muted-foreground">
        {t("fieldsProgress", { done: validatedCount, total: totalCount })}
      </p>
    </div>
  );
}
