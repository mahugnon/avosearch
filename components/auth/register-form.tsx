"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerClientAction } from "@/lib/actions/auth";
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

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerClientAction, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>
          Déposez votre premier contrat en quelques minutes.
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
            <Input id="name" name="name" autoComplete="name" placeholder="Camille Martin" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.fr"
              required
            />
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
            <p className="text-xs text-muted-foreground">8 caractères minimum.</p>
          </div>
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Création du compte..." : "Créer mon compte"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Déjà inscrit ?{" "}
            <Link href="/login" className="font-medium text-foreground underline">
              Se connecter
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Vous êtes avocat ?{" "}
            <Link href="/register/lawyer" className="font-medium text-foreground underline">
              Inscription avocat
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
