"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { completeDraftAction, saveDraftFieldAction } from "@/lib/actions/draft";
import type { TemplateField, TemplateStep } from "@/lib/templates/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  contractId: string;
  templateTitle: string;
  templateDescription: string;
  steps: TemplateStep[];
  initialAnswers: Record<string, string>;
};

function StepField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: TemplateField;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const common = {
    id: field.id,
    name: field.id,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    placeholder: field.placeholder,
    required: field.required,
    disabled,
  };

  if (field.type === "textarea") {
    return <Textarea {...common} rows={4} />;
  }

  return (
    <Input
      {...common}
      type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type}
    />
  );
}

export function DraftWizard({
  contractId,
  templateTitle,
  templateDescription,
  steps,
  initialAnswers,
}: Props) {
  const t = useTranslations("contracts.draft");
  const [answers, setAnswers] = useState(initialAnswers);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const totalSteps = steps.length;
  const currentStep = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

  const canProceed = useMemo(() => {
    return currentStep.fields.every((field) => {
      if (!field.required) return true;
      return Boolean(answers[field.id]?.trim());
    });
  }, [answers, currentStep.fields]);

  async function persistCurrentStep(): Promise<boolean> {
    for (const field of currentStep.fields) {
      const value = answers[field.id] ?? "";
      if (field.required && !value.trim()) {
        setError(t("errors.required"));
        return false;
      }
      await saveDraftFieldAction(contractId, field.id, value);
    }
    setError(null);
    return true;
  }

  function handleNext() {
    startTransition(async () => {
      const ok = await persistCurrentStep();
      if (!ok) return;
      if (stepIndex < totalSteps - 1) {
        setStepIndex((i) => i + 1);
      } else {
        const result = await completeDraftAction(contractId);
        if (result?.error) setError(t("errors.missingFields"));
      }
    });
  }

  function handleBack() {
    setError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>{templateTitle}</CardTitle>
            <CardDescription>{templateDescription}</CardDescription>
          </div>
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {t("progress", { current: stepIndex + 1, total: totalSteps })}
          </p>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-foreground transition-all" style={{ width: `${progress}%` }} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-medium">{currentStep.title}</h2>
          {currentStep.description && (
            <p className="text-sm text-muted-foreground">{currentStep.description}</p>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {currentStep.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}
              <StepField
                field={field}
                value={answers[field.id] ?? ""}
                onChange={(value) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [field.id]: value,
                  }))
                }
                disabled={pending}
              />
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>

        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={handleBack} disabled={stepIndex === 0 || pending}>
            {t("back")}
          </Button>
          <Button type="button" onClick={handleNext} disabled={!canProceed || pending}>
            {pending
              ? t("saving")
              : stepIndex === totalSteps - 1
                ? t("finish")
                : t("next")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
