import Link from "next/link";
import { FileText, Scale, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { formatEuros, pricing } from "@/lib/config";

const STEPS = [
  {
    icon: FileText,
    title: "1. Déposez votre contrat",
    description:
      "Téléversez un PDF, un DOCX ou un texte, ou décrivez simplement votre question contractuelle.",
  },
  {
    icon: Scale,
    title: "2. Obtenez une orientation claire",
    description:
      "Notre outil identifie le type de contrat, les points d'attention, et vous oriente : relecture assistée, avocat au forfait, ou professionnel réglementé.",
  },
  {
    icon: ShieldCheck,
    title: "3. Choisissez votre niveau de sécurité",
    description:
      "Relisez les modifications proposées vous-même, ou faites-les valider une à une par un avocat inscrit au barreau, sous 24 h.",
  },
] as const;

const FAQ = [
  {
    question: "AvoSearch remplace-t-il un avocat ?",
    answer:
      "Non. AvoSearch est un outil d'aide documentaire : il vous aide à comprendre votre contrat et à préparer des modifications. Pour un avis sur votre situation, choisissez la formule avec validation par un avocat ou une mission au forfait.",
  },
  {
    question: "Quels documents puis-je faire analyser ?",
    answer:
      "Uniquement des contrats : bail commercial, prestation de services, CGV, partenariat, etc. Les sujets pénaux, familiaux ou contentieux sont hors périmètre : nous vous orientons alors vers le bon professionnel, sans analyse.",
  },
  {
    question: "Qui sont les avocats de la plateforme ?",
    answer:
      "Des avocats inscrits à un barreau français. Chaque profil est vérifié manuellement par notre équipe avant d'obtenir le badge « Vérifié ».",
  },
  {
    question: "Combien ça coûte ?",
    answer:
      "Trois formules à prix fixes, affichés avant tout engagement : relecture assistée, relecture avec validation avocat, ou mission au forfait convenue à l'avance. Aucune facturation à l'heure, aucune surprise.",
  },
  {
    question: "Mes documents sont-ils confidentiels ?",
    answer:
      "Vos documents ne sont accessibles qu'à vous et, si vous le décidez, à l'avocat missionné. Vous pouvez exporter vos données et supprimer votre compte à tout moment.",
  },
] as const;

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-28">
          <Badge variant="secondary">Contrats uniquement — orientation en moins d&apos;une minute</Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Vos contrats, relus et sécurisés — avec ou sans avocat
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Déposez votre contrat : AvoSearch repère les clauses à risque, propose des
            modifications en suivi de modifications, et vous met en relation avec un avocat
            vérifié quand votre situation le demande.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">Analyser mon contrat</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register/lawyer">Je suis avocat</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Aide documentaire automatisée — ne constitue pas une consultation juridique.
          </p>
        </section>

        {/* How it works */}
        <section id="comment-ca-marche" className="border-t bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight">
              Comment ça marche
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {STEPS.map((step) => (
                <Card key={step.title}>
                  <CardHeader>
                    <step.icon className="mb-2 h-6 w-6 text-muted-foreground" aria-hidden />
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {step.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="tarifs" className="border-t">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight">Nos formules</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
              Des prix fixes, connus avant tout engagement. Prix TTC indicatifs.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Relecture assistée</CardTitle>
                  <CardDescription>
                    Modifications proposées en suivi de modifications ; vous acceptez ou rejetez
                    chaque changement.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <p className="text-3xl font-semibold">
                    {formatEuros(pricing.aiOnlyCents)}
                    <span className="text-sm font-normal text-muted-foreground"> / contrat</span>
                  </p>
                </CardContent>
              </Card>
              <Card className="flex flex-col border-foreground/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Relecture + validation avocat</CardTitle>
                    <Badge>Recommandée</Badge>
                  </div>
                  <CardDescription>
                    Un avocat vérifié relit, valide ou amende chaque modification proposée.
                    Réponse sous 24 h.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <p className="text-3xl font-semibold">
                    {formatEuros(pricing.aiPlusLawyerCents)}
                    <span className="text-sm font-normal text-muted-foreground"> / contrat</span>
                  </p>
                </CardContent>
              </Card>
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Mission avocat au forfait</CardTitle>
                  <CardDescription>
                    Relecture complète, rédaction ou négociation par un avocat, à prix fixe
                    convenu à l&apos;avance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <p className="text-3xl font-semibold">
                    {formatEuros(pricing.missionMinCents)} – {formatEuros(pricing.missionMaxCents)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t bg-muted/30">
          <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight">
              Questions fréquentes
            </h2>
            <div className="mt-10 space-y-4">
              {FAQ.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-lg border bg-background p-4"
                >
                  <summary className="cursor-pointer list-none text-sm font-medium">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Un contrat à signer cette semaine ?
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              Déposez-le maintenant : vous saurez en quelques minutes s&apos;il peut être ajusté
              directement ou s&apos;il mérite l&apos;œil d&apos;un avocat.
            </p>
            <Button asChild size="lg">
              <Link href="/register">Commencer gratuitement</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
