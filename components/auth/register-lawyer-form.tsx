"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useDictionary } from "@/components/providers/locale-provider";
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
  const dict = useDictionary();
  const [state, formAction, pending] = useActionState(registerLawyerAction, undefined);

  return (
    <Card className="surface-elevated border-0 shadow-none">
      <CardHeader>
        <CardTitle>{dict.auth.lawyerRegisterTitle}</CardTitle>
        <CardDescription>{dict.auth.lawyerRegisterDesc}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">{dict.auth.name}</Label>
            <Input id="name" name="name" autoComplete="name" placeholder="Me Exemple Sept" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{dict.auth.email}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{dict.auth.password}</Label>
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
            {pending ? dict.auth.submittingRegister : dict.auth.submitRegister}
          </Button>
          <p className="text-sm text-muted-foreground">
            {dict.auth.alreadyRegistered}{" "}
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              {dict.auth.signInLink}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
