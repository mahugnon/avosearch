"use client";

import { Check, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildDocumentBlocks,
  buildDocumentBlocksFromBody,
  collectFieldNodes,
  type DocumentBlock,
  type InlineNode,
} from "@/lib/templates/document-structure";
import type { ContractSegment } from "@/lib/templates/highlight";

export type ContractViewerMode = "client" | "barrister";

type FieldRenderProps = {
  node: Extract<InlineNode, { kind: "field" }>;
  mode: ContractViewerMode;
  validated: boolean;
  focused: boolean;
  onValidate?: (fieldId: string) => void;
  inlineFieldActions: boolean;
};

function FieldValue({
  node,
  mode,
  validated,
  focused,
  onValidate,
  inlineFieldActions,
}: FieldRenderProps) {
  const t = useTranslations("contracts.viewer");

  const markClass = cn(
    "rounded-[2px] px-1 py-px font-medium not-italic scroll-mt-24",
    validated
      ? "bg-emerald-100/90 text-emerald-950 decoration-emerald-500/70"
      : "bg-amber-100/90 text-amber-950 decoration-amber-500/80",
    "underline decoration-2 underline-offset-[3px]",
    focused && "ring-2 ring-primary/40 ring-offset-1"
  );

  return (
    <span className="group/field relative inline">
      <mark className={markClass} title={node.label} data-field-id={node.fieldId}>
        {node.value}
      </mark>
      {mode === "barrister" && inlineFieldActions && (
        <span className="ml-1 inline-flex align-middle font-sans">
          {validated ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[0.625rem] font-medium text-emerald-800">
              <Check className="size-2.5" aria-hidden />
              {t("validated")}
            </span>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-5 px-2 text-[0.625rem] font-medium opacity-90 shadow-sm group-hover/field:opacity-100"
              onClick={() => onValidate?.(node.fieldId)}
            >
              {t("validate")}
            </Button>
          )}
        </span>
      )}
    </span>
  );
}

function InlineContent({
  nodes,
  mode,
  validatedIds,
  onValidate,
  focusedFieldId,
  inlineFieldActions,
}: {
  nodes: InlineNode[];
  mode: ContractViewerMode;
  validatedIds: Set<string>;
  onValidate?: (fieldId: string) => void;
  focusedFieldId?: string | null;
  inlineFieldActions: boolean;
}) {
  return (
    <>
      {nodes.map((node, i) =>
        node.kind === "text" ? (
          <span key={`t-${i}`}>{node.content}</span>
        ) : (
          <FieldValue
            key={`f-${node.fieldId}-${i}`}
            node={node}
            mode={mode}
            validated={validatedIds.has(node.fieldId)}
            focused={focusedFieldId === node.fieldId}
            onValidate={onValidate}
            inlineFieldActions={inlineFieldActions}
          />
        )
      )}
    </>
  );
}

function DocumentBlockView({
  block,
  mode,
  validatedIds,
  onValidate,
  focusedFieldId,
  inlineFieldActions,
}: {
  block: DocumentBlock;
  mode: ContractViewerMode;
  validatedIds: Set<string>;
  onValidate?: (fieldId: string) => void;
  focusedFieldId?: string | null;
  inlineFieldActions: boolean;
}) {
  const shared = { mode, validatedIds, onValidate, focusedFieldId, inlineFieldActions };

  switch (block.type) {
    case "title":
      return (
        <header className="mb-10 border-b border-neutral-300/80 pb-8 text-center">
          <h1 className="contract-serif text-[1.35rem] font-semibold leading-snug tracking-[0.12em] text-neutral-900 uppercase sm:text-[1.5rem]">
            <InlineContent nodes={block.nodes} {...shared} />
          </h1>
        </header>
      );

    case "party":
      return (
        <p
          className={cn(
            "contract-serif text-[0.9375rem] leading-[1.85] text-neutral-800",
            block.variant === "et" && "mt-5"
          )}
        >
          <span className="font-semibold text-neutral-900">
            {block.variant === "entre" ? "Entre :" : "Et :"}
          </span>{" "}
          <InlineContent
            nodes={block.nodes.filter(
              (n) => n.kind !== "text" || !/^(Entre|Et)\s*:/i.test(n.content.trim())
            )}
            {...shared}
          />
        </p>
      );

    case "preamble":
      return (
        <p className="mt-8 mb-10 text-center contract-serif text-[0.9375rem] italic leading-relaxed text-neutral-700">
          <InlineContent nodes={block.nodes} {...shared} />
        </p>
      );

    case "article":
      return (
        <section className="mt-8 break-inside-avoid">
          <h2 className="mb-3 contract-serif text-[0.9375rem] font-semibold tracking-wide text-neutral-900">
            <span className="text-neutral-500">Article {block.number}</span>
            <span className="mx-2 text-neutral-300" aria-hidden>
              —
            </span>
            {block.heading}
          </h2>
          <div className="space-y-3 border-l-2 border-neutral-200/90 pl-5">
            {block.children.map((child, i) => (
              <DocumentBlockView key={`${block.number}-${i}`} block={child} {...shared} />
            ))}
          </div>
        </section>
      );

    case "paragraph":
      return (
        <p className="contract-serif text-[0.9375rem] leading-[1.85] text-neutral-800">
          <InlineContent nodes={block.nodes} {...shared} />
        </p>
      );

    case "list-item":
      return (
        <div className="flex gap-3 contract-serif text-[0.9375rem] leading-[1.85] text-neutral-800">
          <span className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-neutral-400" aria-hidden />
          <p className="min-w-0 flex-1">
            <InlineContent nodes={block.nodes} {...shared} />
          </p>
        </div>
      );

    case "signature":
      return (
        <p className="mt-12 contract-serif text-[0.9375rem] leading-relaxed text-neutral-800">
          <InlineContent nodes={block.nodes} {...shared} />
        </p>
      );

    case "disclaimer":
      return (
        <footer className="mt-10 border-t border-dashed border-neutral-300 pt-6">
          <p className="text-center font-sans text-[0.6875rem] leading-relaxed text-neutral-500">
            <InlineContent nodes={block.nodes} {...shared} />
          </p>
        </footer>
      );

    default:
      return null;
  }
}

type Props = {
  blocks: DocumentBlock[];
  mode?: ContractViewerMode;
  validatedIds?: Set<string>;
  onValidate?: (fieldId: string) => void;
  focusedFieldId?: string | null;
  inlineFieldActions?: boolean;
  className?: string;
  showLegend?: boolean;
};

export function ContractDocument({
  blocks,
  mode = "client",
  validatedIds = new Set(),
  onValidate,
  focusedFieldId,
  inlineFieldActions = true,
  className,
  showLegend = true,
}: Props) {
  const t = useTranslations("contracts.viewer");

  const fieldNodes = useMemo(() => collectFieldNodes(blocks), [blocks]);
  const uniqueFieldIds = useMemo(
    () => [
      ...new Set(
        fieldNodes
          .filter((n): n is Extract<InlineNode, { kind: "field" }> => n.kind === "field")
          .map((n) => n.fieldId)
      ),
    ],
    [fieldNodes]
  );

  const validatedCount = uniqueFieldIds.filter((id) => validatedIds.has(id)).length;
  const totalFields = uniqueFieldIds.length;
  const allValidated = totalFields > 0 && validatedCount === totalFields;

  return (
    <div className={cn("space-y-4", className)}>
      {showLegend && totalFields > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200/60 bg-amber-50/50 px-3 py-2 font-sans dark:border-amber-500/20 dark:bg-amber-500/5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-amber-900 dark:text-amber-200">
            <Sparkles className="size-3.5 shrink-0" aria-hidden />
            {t("aiFieldsLegend", { count: totalFields })}
          </p>
          {mode === "barrister" && (
            <p className="text-xs text-muted-foreground">
              {allValidated
                ? t("allValidated")
                : t("validationProgress", { done: validatedCount, total: totalFields })}
            </p>
          )}
        </div>
      )}

      <div className="contract-paper relative mx-auto max-w-[44rem] rounded-sm bg-[#fdfcfa] px-7 py-9 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.04)] ring-1 ring-neutral-200/80 sm:px-11 sm:py-12">
        {blocks.map((block, i) => (
          <DocumentBlockView
            key={i}
            block={block}
            mode={mode}
            validatedIds={validatedIds}
            onValidate={onValidate}
            focusedFieldId={focusedFieldId}
            inlineFieldActions={inlineFieldActions}
          />
        ))}
      </div>

      {mode === "barrister" && allValidated && (
        <p className="rounded-lg border border-emerald-400/40 bg-emerald-50 px-3 py-2 font-sans text-xs text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
          {t("allValidatedHint")}
        </p>
      )}
    </div>
  );
}

export function ContractDocumentFromSegments(props: {
  segments: ContractSegment[];
  mode?: ContractViewerMode;
  validatedIds?: Set<string>;
  onValidate?: (fieldId: string) => void;
  focusedFieldId?: string | null;
  inlineFieldActions?: boolean;
  className?: string;
  showLegend?: boolean;
}) {
  const blocks = useMemo(() => buildDocumentBlocks(props.segments), [props.segments]);
  return (
    <ContractDocument
      blocks={blocks}
      mode={props.mode}
      validatedIds={props.validatedIds}
      onValidate={props.onValidate}
      focusedFieldId={props.focusedFieldId}
      inlineFieldActions={props.inlineFieldActions}
      showLegend={props.showLegend}
      className={props.className}
    />
  );
}

export function ContractDocumentFromBody(props: {
  body: string;
  mode?: ContractViewerMode;
  className?: string;
}) {
  const blocks = useMemo(() => buildDocumentBlocksFromBody(props.body), [props.body]);
  return (
    <ContractDocument blocks={blocks} mode={props.mode} className={props.className} showLegend={false} />
  );
}
