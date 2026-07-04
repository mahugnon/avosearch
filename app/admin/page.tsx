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

export default async function AdminPage() {
  const profiles = await prisma.lawyerProfile.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: [{ verified: "asc" }, { createdAt: "asc" }],
  });

  const pendingCount = profiles.filter((profile) => !profile.verified).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vérification des avocats</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pendingCount} profil{pendingCount > 1 ? "s" : ""} en attente. Les actions Vérifier /
          Refuser arrivent avec la Phase 3.
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avocat</TableHead>
              <TableHead>Barreau</TableHead>
              <TableHead>Spécialités</TableHead>
              <TableHead>Tarif validation</TableHead>
              <TableHead>Statut</TableHead>
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
                    <Badge>Vérifié</Badge>
                  ) : (
                    <Badge variant="secondary">En attente</Badge>
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
