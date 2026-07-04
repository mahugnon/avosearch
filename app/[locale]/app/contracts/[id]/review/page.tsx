import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { getLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

/** Client review page removed — contract review is lawyer-only. */
export default async function ContractReviewPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const locale = (await getLocale()) as AppLocale;

  if (!session?.user) {
    redirect(localizedPath("/login", locale));
  }

  if (session.user.role === "LAWYER") {
    redirect(localizedPath("/lawyer/missions", locale));
  }

  if (session.user.role === "ADMIN") {
    redirect(localizedPath("/admin", locale));
  }

  redirect(localizedPath(`/app/contracts/${id}`, locale));
}
