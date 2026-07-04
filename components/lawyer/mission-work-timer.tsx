"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { formatDuration } from "@/lib/matching/billing";
import { formatEuros } from "@/lib/config";
import type { AppLocale } from "@/lib/i18n";
import { useLocale } from "next-intl";

type Props = {
  workStartedAt: string | null;
  storedSeconds: number;
  hourlyRateCents: number;
  minimumCents: number;
};

export function MissionWorkTimer({
  workStartedAt,
  storedSeconds,
  hourlyRateCents,
  minimumCents,
}: Props) {
  const t = useTranslations("lawyer.mission.timer");
  const locale = useLocale() as AppLocale;
  const startedAt = workStartedAt ? new Date(workStartedAt).getTime() : null;

  const [elapsed, setElapsed] = useState(storedSeconds);

  useEffect(() => {
    if (!startedAt) {
      setElapsed(storedSeconds);
      return;
    }

    const startMs = startedAt;

    function tick() {
      const running = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      setElapsed(storedSeconds + running);
    }

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startedAt, storedSeconds]);

  const quarterHours = Math.max(1, Math.ceil(elapsed / 900));
  const projectedCents = Math.max(
    minimumCents,
    Math.ceil((quarterHours / 4) * hourlyRateCents)
  );

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t("label")}
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{formatDuration(elapsed)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{t("projectedPrice")}</p>
          <p className="text-lg font-semibold">{formatEuros(projectedCents, locale)}</p>
          <p className="text-xs text-muted-foreground">
            {t("rate", { rate: formatEuros(hourlyRateCents, locale) })}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{t("hint")}</p>
    </div>
  );
}
