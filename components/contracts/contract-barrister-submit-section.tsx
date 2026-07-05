"use client";

import { useTranslations } from "next-intl";
import { RequestBarristerButton } from "@/components/contracts/request-barrister-button";
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

export function ContractBarristerSubmitSection({ contractId }: Props) {
  const t = useTranslations("contracts.barristerSubmit");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <RequestBarristerButton contractId={contractId} />
        <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
      </CardContent>
    </Card>
  );
}
