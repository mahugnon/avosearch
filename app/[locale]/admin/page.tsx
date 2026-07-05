import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { verifyBarristerAction, rejectBarristerAction } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { formatEuros } from "@/lib/config";
import type { AppLocale } from "@/lib/i18n";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminPage() {
  const t = await getTranslations("admin");
  const tc = await getTranslations("common");
  const locale = (await getLocale()) as AppLocale;

  const profiles = await prisma.barristerProfile.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: [{ verified: "asc" }, { createdAt: "asc" }],
  });

  const pendingCount = profiles.filter((profile) => !profile.verified).length;

  return (
    <div className="space-y-8">
      <AdminNav />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("pendingCount", { count: pendingCount })}
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.barrister")}</TableHead>
              <TableHead>{t("columns.barreau")}</TableHead>
              <TableHead>{t("columns.specialties")}</TableHead>
              <TableHead>{t("columns.validationPrice")}</TableHead>
              <TableHead>{t("columns.status")}</TableHead>
              <TableHead>{t("columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>
                  <p className="font-medium">{profile.user.name}</p>
                  <p className="text-xs text-muted-foreground">{profile.user.email}</p>
                </TableCell>
                <TableCell>{profile.barreau}</TableCell>
                <TableCell className="max-w-56">
                  <span className="text-sm text-muted-foreground">
                    {profile.specialties.join(", ")}
                  </span>
                </TableCell>
                <TableCell>{formatEuros(profile.validationPriceCents, locale)}</TableCell>
                <TableCell>
                  {profile.verified ? (
                    <Badge>{tc("verified")}</Badge>
                  ) : (
                    <Badge variant="secondary">{tc("pending")}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {!profile.verified ? (
                    <div className="flex gap-2">
                      <form action={verifyBarristerAction.bind(null, profile.id)}>
                        <Button type="submit" size="sm">
                          {t("verify")}
                        </Button>
                      </form>
                      <form action={rejectBarristerAction.bind(null, profile.id)}>
                        <Button type="submit" size="sm" variant="outline">
                          {t("reject")}
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
