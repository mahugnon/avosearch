import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { getLocale } from "next-intl/server";

export async function requireClientContract(contractId: string) {
  const session = await auth();
  const locale = (await getLocale()) as AppLocale;

  if (!session || session.user.role !== "CLIENT") {
    redirect(localizedPath(session?.user.role === "ADMIN" ? "/admin" : "/login", locale));
  }

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      analysis: { include: { modifications: { orderBy: { order: "asc" } } } },
      template: true,
    },
  });

  if (!contract || contract.ownerId !== session.user.id) {
    notFound();
  }

  return { session, contract, locale };
}
