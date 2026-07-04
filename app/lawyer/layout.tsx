import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { auth } from "@/lib/auth";

export default async function LawyerAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "LAWYER") redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader
        homeHref="/lawyer"
        areaLabel="Espace avocat"
        userName={session.user.name ?? session.user.email ?? ""}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
