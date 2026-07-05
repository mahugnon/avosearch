"use client";

import { Check, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import type { BarristerMatchView } from "@/lib/matching/barrister-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatEuros } from "@/lib/config";
import type { AppLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  barrister: BarristerMatchView;
  locale: AppLocale;
  selected?: boolean;
  priceCents?: number;
  onSelect?: () => void;
  showSelectButton?: boolean;
  pending?: boolean;
  showMatchReason?: boolean;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function BarristerProfileCard({
  barrister,
  locale,
  selected = false,
  priceCents,
  onSelect,
  showSelectButton = false,
  pending = false,
  showMatchReason = false,
}: Props) {
  const t = useTranslations("contracts.barristerSelection");

  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors",
        selected && "border-primary ring-2 ring-primary/20",
        !selected && onSelect && "hover:border-primary/40"
      )}
      onClick={onSelect}
    >
      <CardContent className="flex gap-4 p-4">
        <div className="relative shrink-0">
          <Avatar size="lg" className="size-14">
            {barrister.photoUrl && <AvatarImage src={barrister.photoUrl} alt={barrister.name} />}
            <AvatarFallback>{initials(barrister.name)}</AvatarFallback>
          </Avatar>
          {selected && (
            <span className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background">
              <Check className="size-3" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold leading-tight">{barrister.name}</p>
              <p className="text-sm text-muted-foreground">
                {barrister.barreau} · {barrister.city}
              </p>
            </div>
            {barrister.rating != null && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {barrister.rating.toFixed(1)} ({barrister.ratingCount})
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {barrister.specialties.slice(0, 3).map((s) => (
              <Badge key={s} variant="outline" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            {t("responseTime", { hours: barrister.responseTimeHours })}
            {priceCents != null && <> · {formatEuros(priceCents, locale)}</>}
          </p>

          {showMatchReason && selected && barrister.matchReason && (
            <p className="text-sm leading-relaxed text-foreground/80">{barrister.matchReason}</p>
          )}

          {showSelectButton && onSelect && (
            <Button
              type="button"
              size="sm"
              variant={selected ? "default" : "outline"}
              disabled={pending}
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              {selected ? t("selected") : t("choose")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
