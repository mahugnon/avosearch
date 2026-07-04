"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useDictionary } from "@/components/providers/locale-provider";
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
  const dict = useDictionary();
  const [state, formAction, pending] = useActionState(registerClientAction, undefined);

  return (
    <Card className="surface-elevated border-0 shadow-none">
      <CardHeader>
        <CardTitle>{dict.auth.registerTitle}</CardTitle>
        <CardDescription>{dict.auth.registerSubtitle}</CardDescription>
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
            <Input id="name" name="name" autoComplete="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{dict.auth.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={dict.auth.emailPlaceholder}
              required
            />
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
            <p className="text-xs text-muted-foreground">{dict.auth.passwordHint}</p>
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
          <p className="text-sm text-muted-foreground">
            {dict.auth.areYouLawyer}{" "}
            <Link href="/register/lawyer" className="font-medium text-primary underline-offset-4 hover:underline">
              {dict.auth.lawyerSignupLink}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
