"use client";

import { MessageSquarePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ChatThread } from "@/lib/chat/local-history";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
};

export function ChatHistoryPanel({ threads, activeThreadId, onSelect, onNew }: Props) {
  const t = useTranslations("chat.history");

  if (threads.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{t("title")}</p>
        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={onNew}>
          <MessageSquarePlus className="size-3.5" />
          {t("new")}
        </Button>
      </div>
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {threads.map((thread) => (
          <li key={thread.id} className="shrink-0">
            <button
              type="button"
              onClick={() => onSelect(thread.id)}
              className={cn(
                "max-w-[14rem] truncate rounded-full border px-3 py-1.5 text-left text-xs transition-colors",
                thread.id === activeThreadId
                  ? "border-primary/30 bg-primary/10 text-foreground"
                  : "border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground"
              )}
            >
              {thread.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
