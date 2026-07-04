import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function LoginPage() {
  return (
    <div className="space-y-4">
      <LoginForm />
      <div className="rounded-lg border bg-background p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Comptes de démonstration</p>
        <p className="mt-1">
          client1@avosearch.test · avocat1@avosearch.test · admin@avosearch.test
        </p>
        <p>
          Mot de passe : <code className="font-mono">demo1234</code>
        </p>
      </div>
    </div>
  );
}
