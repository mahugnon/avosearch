"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useActionState } from "react";
import { registerLawyerAction } from "@/lib/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function RegisterLawyerForm() {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(registerLawyerAction, undefined);

  return (
    <Card className="surface-elevated border-0 shadow-none">
      <CardHeader>
        <CardTitle>{t("lawyerRegisterTitle")}</CardTitle>
        <CardDescription>{t("lawyerRegisterDescription")}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">{t("fullName")}</Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder={t("lawyerNamePlaceholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("professionalEmail")}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="barreau">{t("barreau")}</Label>
              <Input id="barreau" name="barreau" placeholder={t("cityPlaceholder")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{t("city")}</Label>
              <Input id="city" name="city" placeholder={t("cityPlaceholder")} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialties">{t("specialties")}</Label>
            <Input
              id="specialties"
              name="specialties"
              placeholder={t("specialtiesPlaceholder")}
              required
            />
            <p className="text-xs text-muted-foreground">{t("specialtiesHint")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="validationPriceCents">{t("validationPriceCents")}</Label>
              <Input
                id="validationPriceCents"
                name="validationPriceCents"
                type="number"
                min={1000}
                max={100000}
                defaultValue={7900}
                required
              />
              <p className="text-xs text-muted-foreground">{t("validationPriceHint")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="responseTimeHours">{t("responseTimeHours")}</Label>
              <Input
                id="responseTimeHours"
                name="responseTimeHours"
                type="number"
                min={1}
                max={168}
                defaultValue={24}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">{t("bio")}</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={4}
              placeholder={t("bioPlaceholder")}
              required
              minLength={20}
            />
          </div>
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t("creatingAccount") : t("createLawyerAccount")}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t("alreadyRegistered")}{" "}
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              {t("signIn")}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
