"use client";

import { Paperclip } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { sendMissionMessageFormAction } from "@/lib/actions/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  body: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  createdAt: Date;
  sender: { id: string; name: string; role: string };
};

type Props = {
  missionId: string;
  initialMessages: Message[];
  currentUserId: string;
  allowAttachments?: boolean;
};

export function MissionChat({
  missionId,
  initialMessages,
  currentUserId,
  allowAttachments = true,
}: Props) {
  const t = useTranslations("missions.chat");
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSend() {
    const text = draft.trim();
    const file = fileRef.current?.files?.[0];
    if (!text && !file) return;

    const formData = new FormData();
    formData.set("missionId", missionId);
    formData.set("body", text);
    if (file) formData.set("attachment", file);

    startTransition(async () => {
      const result = await sendMissionMessageFormAction(formData);
      if (!result.ok) return;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          body: text || t("attachmentOnly"),
          attachmentUrl: result.attachmentUrl ?? null,
          attachmentName: result.attachmentName ?? null,
          createdAt: new Date(),
          sender: { id: currentUserId, name: t("you"), role: "CLIENT" },
        },
      ]);
      setDraft("");
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  return (
    <div className="space-y-4 rounded-xl border">
      <div className="max-h-80 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        )}
        {messages.map((msg) => {
          const mine = msg.sender.id === currentUserId;
          return (
            <div key={msg.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  mine ? "bg-foreground text-background" : "bg-muted"
                )}
              >
                {!mine && <p className="mb-0.5 text-xs opacity-70">{msg.sender.name}</p>}
                {msg.body && <p className="whitespace-pre-wrap">{msg.body}</p>}
                {msg.attachmentUrl && (
                  <a
                    href={msg.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "mt-1 inline-flex items-center gap-1 text-xs underline",
                      mine ? "text-background/90" : "text-primary"
                    )}
                  >
                    <Paperclip className="size-3" />
                    {msg.attachmentName ?? t("downloadAttachment")}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="space-y-2 border-t p-3">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder={t("placeholder")}
          disabled={pending}
          className="min-h-0 resize-none"
        />
        <div className="flex items-center justify-between gap-2">
          {allowAttachments ? (
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="hidden"
                id={`mission-file-${missionId}`}
                disabled={pending}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5"
                disabled={pending}
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip className="size-3.5" />
                {t("attach")}
              </Button>
            </div>
          ) : (
            <span />
          )}
          <Button type="button" onClick={handleSend} disabled={pending}>
            {t("send")}
          </Button>
        </div>
      </div>
    </div>
  );
}
