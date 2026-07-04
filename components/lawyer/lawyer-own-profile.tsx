import { MissionType, type LawyerProfile, type User } from "@prisma/client";
import { Star } from "lucide-react";
import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatEuros } from "@/lib/config";
import type { AppLocale } from "@/lib/i18n";
import type { LawyerProfileStats } from "@/lib/lawyer/profile-stats";
import { cn } from "@/lib/utils";

type ProfileWithUser = LawyerProfile & {
  user: Pick<User, "name" | "email">;
};

interface LawyerOwnProfileProps {
  profile: ProfileWithUser;
  stats: LawyerProfileStats;
}

const FLAT_FEE_TYPES: MissionType[] = [
  MissionType.VALIDATION,
  MissionType.RELECTURE,
  MissionType.REDACTION,
  MissionType.NEGOCIATION,
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export async function LawyerOwnProfile({ profile, stats }: LawyerOwnProfileProps) {
  const t = await getTranslations("lawyer");
  const tm = await getTranslations("lawyer.missions.type");
  const tc = await getTranslations("common");
  const locale = (await getLocale()) as AppLocale;

  const flatFees = profile.flatFees as Partial<Record<MissionType, number>>;

  return (
    <div className="space-y-6">
      <section className="surface-elevated rounded-xl p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="size-14 shrink-0">
              <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">
                {initials(profile.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">{profile.user.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.user.email}</p>
              <p className="text-sm text-muted-foreground">
                {profile.barreau} · {profile.city}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {profile.verified ? (
              <Badge>{tc("verified")}</Badge>
            ) : (
              <Badge variant="secondary">{tc("pendingVerification")}</Badge>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard
            label={t("totalEarnings")}
            value={formatEuros(stats.earningsCents, locale)}
            hint={t("profile.earningsHint")}
          />
          <StatCard
            label={t("profile.stats.delivered")}
            value={String(stats.deliveredCount)}
            hint={
              stats.inProgressCount > 0
                ? t("profile.stats.inProgressHint", { count: stats.inProgressCount })
                : undefined
            }
          />
          <StatCard
            label={t("profile.rating")}
            value={
              profile.rating != null ? (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                  {profile.rating.toFixed(1)}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({profile.ratingCount})
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )
            }
            hint={
              stats.awaitingClientCount > 0
                ? t("profile.stats.awaitingClientHint", {
                    count: stats.awaitingClientCount,
                  })
                : undefined
            }
          />
        </div>
      </section>

      <section className="surface-elevated rounded-xl p-5 sm:p-6">
        <SectionTitle title={t("profile.sections.practice")} />
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("specialties")}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.specialties.map((specialty) => (
                <Badge key={specialty} variant="outline">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
          {profile.bio.trim() && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("profile.bio")}
              </p>
              <p className="mt-2 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>
      </section>

      <section className="surface-elevated rounded-xl p-5 sm:p-6">
        <SectionTitle title={t("profile.sections.rates")} />
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <DetailItem
            label={t("validationPrice")}
            value={formatEuros(profile.validationPriceCents, locale)}
          />
          <DetailItem
            label={t("profile.hourlyRate")}
            value={t("profile.hourlyRateValue", {
              rate: formatEuros(profile.hourlyRateCents, locale),
            })}
          />
          <DetailItem
            label={t("responseTime")}
            value={t("responseTimeHours", { hours: profile.responseTimeHours })}
          />
        </dl>

        {FLAT_FEE_TYPES.some((type) => flatFees[type] != null) && (
          <>
            <Separator className="my-5" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("profile.flatFees")}
            </p>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {FLAT_FEE_TYPES.map((type) => {
                const cents = flatFees[type];
                if (cents == null) return null;
                return (
                  <DetailItem
                    key={type}
                    label={tm(type)}
                    value={formatEuros(cents, locale)}
                  />
                );
              })}
            </dl>
          </>
        )}
      </section>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-sm font-semibold tracking-tight">{title}</h3>;
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("space-y-1")}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
