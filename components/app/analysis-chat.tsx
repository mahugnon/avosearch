"use client";

import { ArrowUp, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { draftChatAction } from "@/lib/actions/draft-chat";
import { ContractViewer } from "@/components/contracts/contract-viewer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChatRole = "assistant" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="typing-dot size-1.5 rounded-full bg-muted-foreground/60" />
      ))}
    </div>
  );
}

export function AnalysisChat() {
  const t = useTranslations("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [contractId, setContractId] = useState<string | undefined>();
  const [contractBody, setContractBody] = useState<string | undefined>();
  const [contractTitle, setContractTitle] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userHistoryRef = useRef<string[]>([]);

  useEffect(() => {
    setMessages([{ id: "welcome", role: "assistant", content: t("welcome") }]);
    userHistoryRef.current = [];
    setContractId(undefined);
    setContractBody(undefined);
    setContractTitle(undefined);
    setError(null);
  }, [t]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isThinking) return;

      setError(null);
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: text }]);
      userHistoryRef.current.push(text);
      setDraft("");
      setIsThinking(true);

      try {
        const result = await draftChatAction({
          contractId,
          message: text,
          history: userHistoryRef.current,
        });

        if (result.error) {
          setError(t(`errors.${result.error}` as "errors.unauthorized"));
        }

        if (result.contractId) {
          setContractId(result.contractId);
        }

        if (result.completed && result.contractBody) {
          setContractBody(result.contractBody);
          setContractTitle(result.contractTitle);
        }

        if (result.assistantMessage) {
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "assistant", content: result.assistantMessage },
          ]);
        }
      } catch {
        setError(t("errors.generic"));
      } finally {
        setIsThinking(false);
      }
    },
    [contractId, isThinking, t]
  );

  function handleSend() {
    void sendMessage(draft.trim());
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={cn("grid gap-6", contractBody ? "lg:grid-cols-2" : "grid-cols-1")}>
      <section className="surface-elevated overflow-hidden rounded-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-4 sm:px-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-3.5" aria-hidden />
              </div>
              <h2 className="text-base font-semibold tracking-tight">{t("title")}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
            {t("online")}
          </div>
        </header>

        {error && (
          <div className="px-5 pt-4 sm:px-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div
          ref={scrollRef}
          className="flex max-h-[28rem] min-h-72 flex-col gap-5 overflow-y-auto bg-muted/25 px-5 py-6 sm:px-6"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[88%] px-4 py-2.5 text-[0.9375rem] leading-relaxed whitespace-pre-wrap",
                  message.role === "assistant"
                    ? "rounded-2xl rounded-tl-md border border-border/50 bg-card text-foreground shadow-sm"
                    : "rounded-2xl rounded-tr-md bg-foreground text-background"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-tl-md border border-border/50 bg-card px-4 py-3 shadow-sm">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>

        <footer className="space-y-3 border-t border-border/60 bg-card px-4 py-4 sm:px-5">
          <div className="flex items-end gap-2 rounded-xl border border-border/60 bg-muted/30 p-2 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={contractBody ? t("placeholderDone") : t("placeholder")}
              rows={1}
              disabled={isThinking}
              className="min-h-10 flex-1 resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
            />
            <Button
              type="button"
              size="icon"
              className="size-9 shrink-0 rounded-lg"
              onClick={handleSend}
              disabled={!draft.trim() || isThinking}
              aria-label={t("send")}
            >
              <ArrowUp />
            </Button>
          </div>
        </footer>
      </section>

      {contractBody && contractTitle && (
        <ContractViewer
          title={contractTitle}
          body={contractBody}
          contractId={contractId}
          showLawyerRequest
          className="min-h-[28rem] lg:max-h-[calc(28rem+8rem)]"
        />
      )}
    </div>
  );
}
