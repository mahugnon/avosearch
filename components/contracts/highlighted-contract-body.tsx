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
};

export function HighlightedContractBody({
  highlight,
  mode = "client",
  className,
}: Props) {
  const [validatedIds, setValidatedIds] = useState<Set<string>>(new Set());

  const segments = useMemo(
    () => buildContractSegments(highlight.templateBody, highlight.answers, highlight.fields),
    [highlight]
  );

  function handleValidate(fieldId: string) {
    setValidatedIds((prev) => new Set(prev).add(fieldId));
  }

  return (
    <ContractDocumentFromSegments
      segments={segments}
      mode={mode}
      validatedIds={validatedIds}
      onValidate={handleValidate}
      className={className}
    />
  );
}

export type { ContractViewerMode };
