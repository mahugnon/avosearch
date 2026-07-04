"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerLawyerAction } from "@/lib/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function RegisterLawyerForm() {
  const [state, formAction, pending] = useActionState(registerLawyerAction, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inscription avocat</CardTitle>
        <CardDescription>
          Votre profil sera vérifié manuellement par notre équipe avant d&apos;être visible des
          clients.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" name="name" autoComplete="name" placeholder="Me Exemple Sept" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail professionnelle</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="barreau">Barreau</Label>
              <Input id="barreau" name="barreau" placeholder="Paris" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville d&apos;exercice</Label>
              <Input id="city" name="city" placeholder="Paris" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialties">Spécialités</Label>
            <Input
              id="specialties"
              name="specialties"
              placeholder="Baux commerciaux, Droit commercial"
              required
            />
            <p className="text-xs text-muted-foreground">Séparez les spécialités par des virgules.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="validationPriceCents">Tarif validation (centimes)</Label>
              <Input
                id="validationPriceCents"
                name="validationPriceCents"
                type="number"
                min={1000}
                max={100000}
                defaultValue={7900}
                required
              />
              <p className="text-xs text-muted-foreground">Ex. 7900 = 79 € TTC.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="responseTimeHours">Délai de réponse (heures)</Label>
              <Input
                id="responseTimeHours"
                name="responseTimeHours"
                type="number"
                min={1}
                max={168}
                defaultValue={24}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Présentation</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={4}
              placeholder="Votre pratique, vos types de dossiers, votre approche..."
              required
              minLength={20}
            />
          </div>
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Création du compte..." : "Créer mon compte avocat"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Déjà inscrit ?{" "}
            <Link href="/login" className="font-medium text-foreground underline">
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
