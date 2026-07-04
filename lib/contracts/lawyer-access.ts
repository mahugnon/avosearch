import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { getLocale } from "next-intl/server";

export async function requireLawyerContractReview(contractId: string) {
  const session = await auth();
  const locale = (await getLocale()) as AppLocale;

  if (!session || session.user.role !== "LAWYER") {
    redirect(localizedPath("/login", locale));
  }

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      template: true,
      analysis: true,
      owner: { select: { name: true, email: true } },
    },
  });

  if (!contract?.template || !contract.draftAnswers) {
    notFound();
  }

  return { session, contract, locale };
}
