"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TemplateFormState } from "@/lib/actions/admin-templates";
import { slugifyTitle } from "@/lib/validation/template-admin";

type Props = {
  action: (prev: TemplateFormState, formData: FormData) => Promise<TemplateFormState>;
  initial?: {
    slug: string;
    title: string;
    description: string;
    domain: string;
    tags: string[];
    draftGuide?: string | null;
    active: boolean;
    fileName?: string | null;
  };
  mode: "create" | "edit";
};

export function TemplateForm({ action, initial, mode }: Props) {
  const t = useTranslations("admin.templates.form");
  const te = useTranslations("admin.templates.errors");
  const [state, formAction, pending] = useActionState(action, {});
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));

  const errorMessage = state.error ? te(state.error as Parameters<typeof te>[0]) : null;

  function handleTitleBlur(title: string) {
    if (!slugTouched && title.trim()) {
      setSlug(slugifyTitle(title));
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {errorMessage && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("sections.general")}</CardTitle>
          <CardDescription>{t("sections.generalHint")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">{t("title")}</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={initial?.title}
                onBlur={(e) => handleTitleBlur(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t("slug")}</Label>
              <Input
                id="slug"
                name="slug"
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="nda-site-web"
              />
              <p className="text-xs text-muted-foreground">{t("slugHint")}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={3}
              defaultValue={initial?.description}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="domain">{t("domain")}</Label>
              <Input
                id="domain"
                name="domain"
                required
                defaultValue={initial?.domain}
                placeholder="confidentialité / NDA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">{t("tags")}</Label>
              <Input
                id="tags"
                name="tags"
                required
                defaultValue={initial?.tags.join(", ")}
                placeholder="nda, confidentialité, web"
              />
              <p className="text-xs text-muted-foreground">{t("tagsHint")}</p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="active"
              defaultChecked={initial?.active ?? true}
              className="size-4 rounded border-input"
            />
            {t("active")}
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("sections.draftGuide")}</CardTitle>
          <CardDescription>{t("sections.draftGuideHint")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="draftGuide"
            name="draftGuide"
            rows={5}
            defaultValue={initial?.draftGuide ?? ""}
            placeholder={t("draftGuidePlaceholder")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("sections.file")}</CardTitle>
          <CardDescription>{t("sections.fileHint")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {initial?.fileName && (
            <p className="text-sm text-muted-foreground">
              {t("currentFile")}: <span className="font-medium">{initial.fileName}</span>
            </p>
          )}
          <Input
            id="file"
            name="file"
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            required={mode === "create"}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? t("saving") : mode === "create" ? t("create") : t("save")}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/templates">{t("cancel")}</Link>
        </Button>
      </div>
    </form>
  );
}
