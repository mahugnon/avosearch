import { getTranslations } from "next-intl/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { TemplateForm } from "@/components/admin/template-form";
import { createTemplateAction } from "@/lib/actions/admin-templates";

export default async function NewTemplatePage() {
  const t = await getTranslations("admin.templates");

  return (
    <div className="space-y-6">
      <AdminNav />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("newTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("newSubtitle")}</p>
      </div>
      <TemplateForm action={createTemplateAction} mode="create" />
    </div>
  );
}
