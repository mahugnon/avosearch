import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ClientHomePage() {
  const session = await auth();
  const contracts = await prisma.contract.findMany({
    where: { ownerId: session!.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true, analysis: { select: { triage: true } } },
  });

  const firstName = (session!.user.name ?? "").split(" ")[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bonjour{firstName ? ` ${firstName}` : ""} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Décrivez votre besoin ou déposez votre contrat : nous vous orientons vers la bonne
          solution.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Nouvelle analyse</CardTitle>
            <Badge variant="secondary">Disponible en Phase 1</Badge>
          </div>
          <CardDescription>
            Téléversez un contrat (PDF, DOCX, TXT) ou posez votre question contractuelle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ex. : On me propose un bail commercial avec 6 mois de dépôt de garantie et l'interdiction de céder le bail. Est-ce habituel ?"
            rows={4}
            disabled
          />
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              L&apos;upload et l&apos;analyse arrivent avec la Phase 1 (triage IA).
            </p>
            <Button disabled>Analyser</Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Mes contrats</h2>
        {contracts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun contrat pour le moment. Votre premier document apparaîtra ici.
          </p>
        ) : (
          <ul className="space-y-3">
            {contracts.map((contract) => (
              <li key={contract.id}>
                <Card>
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" aria-hidden />
                      <div>
                        <p className="text-sm font-medium">{contract.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Déposé le{" "}
                          {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
                            contract.createdAt
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {contract.analysis ? "Analysé" : "En attente d'analyse"}
                    </Badge>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
