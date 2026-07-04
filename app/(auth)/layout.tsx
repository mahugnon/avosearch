import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <Link href="/" className="mb-8 text-xl font-semibold tracking-tight">
        AvoSearch
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 max-w-md text-center text-xs text-muted-foreground">
        Plateforme de démonstration — aucune donnée réelle. AvoSearch est un outil d&apos;aide
        documentaire et ne fournit pas de consultation juridique.
      </p>
    </div>
  );
}
