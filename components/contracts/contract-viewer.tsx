"use client";

import { Copy, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  body: string;
  contractId?: string;
  className?: string;
};

export function ContractViewer({ title, body, contractId, className }: Props) {
  const t = useTranslations("chat.viewer");

  async function handleCopy() {
    await navigator.clipboard.writeText(body);
  }

  return (
    <section
      className={cn(
        "surface-elevated flex min-h-0 flex-col overflow-hidden rounded-2xl",
        className
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t("label")}
          </p>
          <h3 className="truncate text-sm font-semibold">{title}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5" onClick={handleCopy}>
            <Copy className="size-3.5" />
            {t("copy")}
          </Button>
          {contractId && (
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
              <Link href={`/app/contracts/${contractId}?analyze=1`}>
                <ExternalLink className="size-3.5" />
                {t("analyze")}
              </Link>
            </Button>
          )}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 px-4 py-4 sm:px-5">
        <pre className="whitespace-pre-wrap font-mono text-[0.8125rem] leading-relaxed text-foreground/90">
          {body}
        </pre>
      </div>
      <footer className="border-t border-border/60 px-4 py-2.5 sm:px-5">
        <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
      </footer>
    </section>
  );
}
