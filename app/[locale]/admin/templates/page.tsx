import { FileText, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteTemplateAction,
  toggleTemplateActiveAction,
} from "@/lib/actions/admin-templates";
import { prisma } from "@/lib/db";

export default async function AdminTemplatesPage() {
  const t = await getTranslations("admin.templates");
  const tc = await getTranslations("common");

  const templates = await prisma.contractTemplate.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <AdminNav />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/admin/templates/new">
            <Plus className="size-4" aria-hidden />
            {t("add")}
          </Link>
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="surface-elevated flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
          <FileText className="size-8 text-muted-foreground" aria-hidden />
          <p className="mt-4 text-sm font-medium">{t("empty")}</p>
          <Button asChild className="mt-4" size="sm">
            <Link href="/admin/templates/new">{t("add")}</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.title")}</TableHead>
                <TableHead>{t("columns.domain")}</TableHead>
                <TableHead>{t("columns.file")}</TableHead>
                <TableHead>{t("columns.tags")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <p className="font-medium">{template.title}</p>
                    <p className="text-xs text-muted-foreground">{template.slug}</p>
                  </TableCell>
                  <TableCell className="text-sm">{template.domain}</TableCell>
                  <TableCell className="max-w-48 text-sm text-muted-foreground">
                    {template.fileName ? (
                      <a
                        href={`/api/admin/templates/${template.id}/file`}
                        className="truncate underline-offset-4 hover:underline"
                      >
                        {template.fileName}
                      </a>
                    ) : (
                      t("noFile")
                    )}
                  </TableCell>
                  <TableCell className="max-w-48 text-xs text-muted-foreground">
                    {template.tags.join(", ")}
                  </TableCell>
                  <TableCell>
                    {template.active ? (
                      <Badge>{tc("active")}</Badge>
                    ) : (
                      <Badge variant="secondary">{tc("inactive")}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/templates/${template.id}/edit`}>{t("edit")}</Link>
                      </Button>
                      <form action={toggleTemplateActiveAction.bind(null, template.id)}>
                        <Button type="submit" size="sm" variant="ghost">
                          {template.active ? t("deactivate") : t("activate")}
                        </Button>
                      </form>
                      <form action={deleteTemplateAction.bind(null, template.id)}>
                        <Button type="submit" size="sm" variant="ghost" className="text-destructive">
                          {t("delete")}
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
