"use client";

import { useTranslations } from "next-intl";
import { RequestLawyerButton } from "@/components/contracts/request-lawyer-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  contractId: string;
};

export function ContractLawyerSubmitSection({ contractId }: Props) {
  const t = useTranslations("contracts.lawyerSubmit");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <RequestLawyerButton contractId={contractId} />
        <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
      </CardContent>
    </Card>
  );
}
