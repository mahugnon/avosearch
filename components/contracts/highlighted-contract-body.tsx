"use client";

import { useMemo, useState } from "react";
import { buildContractSegments, type ContractHighlightData } from "@/lib/templates/highlight";
import {
  ContractDocumentFromSegments,
  type ContractViewerMode,
} from "@/components/contracts/contract-document";

type Props = {
  highlight: ContractHighlightData;
  mode?: ContractViewerMode;
  className?: string;
  validatedIds?: Set<string>;
  onValidate?: (fieldId: string) => void;
  focusedFieldId?: string | null;
  inlineFieldActions?: boolean;
  showLegend?: boolean;
};

export function HighlightedContractBody({
  highlight,
  mode = "client",
  className,
  validatedIds: controlledValidatedIds,
  onValidate: controlledOnValidate,
  focusedFieldId,
  inlineFieldActions = true,
  showLegend,
}: Props) {
  const [internalValidatedIds, setInternalValidatedIds] = useState<Set<string>>(new Set());
  const validatedIds = controlledValidatedIds ?? internalValidatedIds;

  const segments = useMemo(
    () =>
      highlight.segments ??
      buildContractSegments(highlight.templateBody, highlight.answers, highlight.fields),
    [highlight]
  );

  function handleValidate(fieldId: string) {
    if (controlledOnValidate) {
      controlledOnValidate(fieldId);
      return;
    }
    setInternalValidatedIds((prev) => new Set(prev).add(fieldId));
  }

  return (
    <ContractDocumentFromSegments
      segments={segments}
      mode={mode}
      validatedIds={validatedIds}
      onValidate={handleValidate}
      focusedFieldId={focusedFieldId}
      inlineFieldActions={inlineFieldActions}
      showLegend={showLegend}
      className={className}
    />
  );
}

export type { ContractViewerMode };
