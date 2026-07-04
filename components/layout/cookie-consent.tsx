"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "avosearch_cookie_consent";

export function CookieConsent() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ essential: true, ts: Date.now() }));
    document.cookie = `${CONSENT_KEY}=1; path=/; max-age=31536000; SameSite=Lax`;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 p-4 shadow-lg backdrop-blur sm:p-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2 text-sm">
          <p id="cookie-title" className="font-semibold text-foreground">
            {t("title")}
          </p>
          <p className="text-muted-foreground">{t("description")}</p>
          <p className="text-xs text-muted-foreground">
            <Link href="/legal/confidentialite" className="underline underline-offset-2">
              {t("privacyLink")}
            </Link>
            {" · "}
            <Link href="/legal/registre-traitements" className="underline underline-offset-2">
              {t("registerLink")}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" size="sm" onClick={accept}>
            {t("accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
