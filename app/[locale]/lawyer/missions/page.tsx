import { MissionStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatEuros } from "@/lib/config";
import { getLocale } from "next-intl/server";
import type { AppLocale } from "@/lib/i18n";
import { redirect } from "next/navigation";
import { localizedPath } from "@/lib/i18n";

export default async function LawyerMissionsPage() {
  const session = await auth();
  const t = await getTranslations("lawyer.missions");
  const locale = (await getLocale()) as AppLocale;

  if (!session || session.user.role !== "LAWYER") {
    redirect(localizedPath("/login", locale));
  }

  const missions = await prisma.mission.findMany({
    where: { lawyerId: session.user.id },
    include: {
      contract: { select: { title: true } },
      client: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <ButtonLink href="/lawyer" label={t("back")} />
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t("title")}</h1>
      </div>
      {missions.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="space-y-3">
          {missions.map((mission) => (
            <li key={mission.id}>
              <Link
                href={`/lawyer/missions/${mission.id}`}
                className="block rounded-xl border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{mission.contract.title}</p>
                  <Badge variant="outline">{t(`status.${mission.status}`)}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mission.client.name} · {formatEuros(mission.priceCents, locale)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ButtonLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-sm text-muted-foreground hover:text-foreground">
      {label}
    </Link>
  );
}
