"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useDictionary } from "@/components/providers/locale-provider";
import { loginAction } from "@/lib/actions/auth";
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

export function LoginForm() {
  const dict = useDictionary();
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <Card className="surface-elevated border-0 shadow-none">
      <CardHeader>
        <CardTitle>{dict.auth.loginTitle}</CardTitle>
        <CardDescription>{dict.auth.loginSubtitle}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
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
              autoComplete="current-password"
              required
              minLength={8}
            />
          </div>
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? dict.auth.submittingLogin : dict.auth.submitLogin}
          </Button>
          <p className="text-sm text-muted-foreground">
            {dict.auth.noAccount}{" "}
            <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
              {dict.auth.createAccount}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
