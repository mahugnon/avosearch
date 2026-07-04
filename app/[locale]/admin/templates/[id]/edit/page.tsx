import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { TemplateForm } from "@/components/admin/template-form";
import { updateTemplateAction } from "@/lib/actions/admin-templates";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditTemplatePage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations("admin.templates");

  const template = await prisma.contractTemplate.findUnique({ where: { id } });
  if (!template) notFound();

  const boundUpdate = updateTemplateAction.bind(null, id);

  return (
    <div className="space-y-6">
      <AdminNav />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("editTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("editSubtitle")}</p>
      </div>
      <TemplateForm
        action={boundUpdate}
        mode="edit"
        initial={{
          slug: template.slug,
          title: template.title,
          description: template.description,
          domain: template.domain,
          tags: template.tags,
          draftGuide: template.draftGuide,
          active: template.active,
          fileName: template.fileName,
        }}
      />
    </div>
  );
}
