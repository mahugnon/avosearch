import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { formatEuros } from "@/lib/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function AdminPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const profiles = await prisma.lawyerProfile.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: [{ verified: "asc" }, { createdAt: "asc" }],
  });

  const pendingCount = profiles.filter((profile) => !profile.verified).length;
  const pendingText =
    pendingCount === 1
      ? dict.admin.pendingSingular.replace("{count}", String(pendingCount))
      : dict.admin.pendingPlural.replace("{count}", String(pendingCount));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{dict.admin.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{pendingText}</p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict.admin.tableLawyer}</TableHead>
              <TableHead>{dict.admin.tableBar}</TableHead>
              <TableHead>{dict.admin.tableSpecialties}</TableHead>
              <TableHead>{dict.admin.tableRate}</TableHead>
              <TableHead>{dict.admin.tableStatus}</TableHead>
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
                <TableCell>{formatEuros(profile.validationPriceCents)}</TableCell>
                <TableCell>
                  {profile.verified ? (
                    <Badge>{dict.admin.verified}</Badge>
                  ) : (
                    <Badge variant="secondary">{dict.admin.pending}</Badge>
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
