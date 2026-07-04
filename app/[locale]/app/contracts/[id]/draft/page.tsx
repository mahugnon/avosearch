import { redirect } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ContractDraftPage({ params }: Props) {
  const { locale } = await params;
  redirect({ href: "/app", locale });
}
