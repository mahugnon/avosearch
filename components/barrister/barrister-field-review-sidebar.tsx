"use client";

import { Check, CheckCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { HighlightField } from "@/lib/templates/highlight";
import {
  FIELD_GROUP_ORDER,
  groupLabel,
  resolveFieldGroup,
  resolveFieldLabel,
  type FieldGroup,
} from "@/lib/templates/field-meta";
import type { AppLocale } from "@/lib/i18n";

type Props = {
  fields: HighlightField[];
  answers: Record<string, string>;
  validatedIds: Set<string>;
  onValidate: (fieldId: string) => void;
  onValidateAll?: () => void;
  onFieldFocus?: (fieldId: string) => void;
  focusedFieldId?: string | null;
  className?: string;
};

function FieldRow({
  field,
  value,
  validated,
  focused,
  label,
  onValidate,
  onFieldFocus,
  approveLabel,
  approvedLabel,
}: {
  field: HighlightField;
  value: string;
  validated: boolean;
  focused?: boolean;
  label: string;
  onValidate: () => void;
  onFieldFocus?: () => void;
  approveLabel: string;
  approvedLabel: string;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onFieldFocus}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onFieldFocus?.();
        }
      }}
      className={cn(
        "group flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
        validated
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-border bg-card hover:border-primary/30 hover:bg-primary/[0.04]",
        focused && "ring-2 ring-primary/30"
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className="mt-0.5 line-clamp-2 break-words text-sm font-medium text-foreground"
          title={`${field.label}: ${value}`}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!validated) onValidate();
        }}
        aria-label={validated ? approvedLabel : approveLabel}
        aria-pressed={validated}
        className={cn(
          "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
          validated
            ? "border-emerald-300 bg-emerald-500 text-white"
            : "border-border text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground"
        )}
      >
        <Check className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

export function BarristerFieldReviewSidebar({
  fields,
  answers,
  validatedIds,
  onValidate,
  onValidateAll,
  onFieldFocus,
  focusedFieldId,
  className,
}: Props) {
  const t = useTranslations("barrister.mission");
  const locale = useLocale() as AppLocale;

  const filledFields = fields.filter((field) => answers[field.id]?.trim());
  if (filledFields.length === 0) return null;

  const validatedCount = filledFields.filter((field) => validatedIds.has(field.id)).length;
  const allValidated = validatedCount === filledFields.length;

  // Group fields for a readable, section-by-section review.
  const grouped = FIELD_GROUP_ORDER.map((group) => ({
    group,
    fields: filledFields.filter((field) => resolveFieldGroup(field.id) === group),
  })).filter((section) => section.fields.length > 0);

  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-card/60 shadow-sm",
        className
      )}
    >
      <header className="flex items-center justify-between gap-2 border-b bg-card px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">{t("fieldsTitle")}</h3>
          <p className="text-xs text-muted-foreground">
            {t("fieldsProgress", { done: validatedCount, total: filledFields.length })}
          </p>
        </div>
        {!allValidated && onValidateAll && (
          <button
            type="button"
            onClick={onValidateAll}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <CheckCheck className="size-3.5" aria-hidden />
            {t("validateAll")}
          </button>
        )}
        {allValidated && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <CheckCheck className="size-3.5" aria-hidden />
            {t("allValidated")}
          </span>
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3">
        {grouped.map((section) => (
          <section key={section.group} className="space-y-1.5">
            <p className="px-1 text-[0.6875rem] font-semibold uppercase tracking-widest text-muted-foreground/70">
              {groupLabel(section.group as FieldGroup, locale)}
            </p>
            <div className="space-y-1.5">
              {section.fields.map((field) => (
                <FieldRow
                  key={field.id}
                  field={field}
                  label={resolveFieldLabel(field.id, locale)}
                  value={answers[field.id]?.trim() ?? ""}
                  validated={validatedIds.has(field.id)}
                  focused={focusedFieldId === field.id}
                  onValidate={() => onValidate(field.id)}
                  onFieldFocus={() => onFieldFocus?.(field.id)}
                  approveLabel={t("approveField")}
                  approvedLabel={t("fieldApproved")}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
