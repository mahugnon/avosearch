"use client";

import { ArrowUp, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  draftChatAction,
  resumeDraftChatAction,
  type AwaitingField,
} from "@/lib/actions/draft-chat";
import { ContractViewer } from "@/components/contracts/contract-viewer";
import { ChatFieldCard } from "@/components/app/chat-field-card";
import { DraftPanelModeToggle, type DraftPanelMode } from "@/components/app/draft-panel-mode-toggle";
import { LogoLoader } from "@/components/brand/logo-loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ContractHighlightData } from "@/lib/templates/highlight";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type Props = {
  contractId: string;
  contractTitle: string;
  initialPreviewBody: string;
  initialAwaitingField?: AwaitingField;
  userQuestion?: string | null;
  highlight?: ContractHighlightData | null;
};

export function DraftResumeChat({
  contractId,
  contractTitle,
  initialPreviewBody,
  initialAwaitingField,
  userQuestion,
  highlight,
}: Props) {
  const t = useTranslations("chat");
  const td = useTranslations("contracts.draft");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isResuming, setIsResuming] = useState(true);
  const [previewBody, setPreviewBody] = useState(initialPreviewBody);
  const [previewTitle, setPreviewTitle] = useState(contractTitle);
  const [previewInProgress, setPreviewInProgress] = useState(true);
  const [previewHighlight, setPreviewHighlight] = useState(highlight ?? null);
  const [awaitingField, setAwaitingField] = useState<AwaitingField | undefined>(initialAwaitingField);
  const [completed, setCompleted] = useState(false);
  const [panelMode, setPanelMode] = useState<DraftPanelMode>("edit");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userHistoryRef = useRef<string[]>(userQuestion?.trim() ? [userQuestion.trim()] : []);
  const resumedRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking, isResuming, awaitingField]);

  useEffect(() => {
    if (resumedRef.current) return;
    resumedRef.current = true;

    const seed: ChatMessage[] = [];
    if (userQuestion?.trim()) {
      seed.push({ id: "initial-question", role: "user", content: userQuestion.trim() });
    }

    void (async () => {
      try {
        const result = await resumeDraftChatAction(contractId);
        if (result?.assistantMessage) {
          setMessages([
            ...seed,
            { id: crypto.randomUUID(), role: "assistant", content: result.assistantMessage },
          ]);
        } else if (seed.length > 0) {
          setMessages(seed);
        }
        if (result?.awaitingField) setAwaitingField(result.awaitingField);
        if (result?.draftPreview) {
          setPreviewBody(result.draftPreview.body);
          setPreviewTitle(result.draftPreview.title);
          setPreviewInProgress(result.draftPreview.inProgress);
        }
      } catch {
        setError(t("errors.generic"));
      } finally {
        setIsResuming(false);
      }
    })();
  }, [contractId, t, userQuestion]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isThinking) return;

      setError(null);
      setAwaitingField(undefined);
      const nextMessages: ChatMessage[] = [
        ...messages,
        { id: crypto.randomUUID(), role: "user", content: text },
      ];
      setMessages(nextMessages);
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

        if (result.draftPreview) {
          setPreviewBody(result.draftPreview.body);
          setPreviewTitle(result.draftPreview.title);
          setPreviewInProgress(result.draftPreview.inProgress);
        }

        if (result.completed && result.contractBody) {
          setPreviewBody(result.contractBody);
          if (result.contractTitle) setPreviewTitle(result.contractTitle);
          setPreviewInProgress(false);
          setCompleted(true);
          setPanelMode("preview");
          setAwaitingField(undefined);
        } else if (result.awaitingField) {
          setAwaitingField(result.awaitingField);
        }

        if (result.assistantMessage) {
          setMessages([
            ...nextMessages,
            { id: crypto.randomUUID(), role: "assistant", content: result.assistantMessage },
          ]);
        }
      } catch {
        setError(t("errors.generic"));
      } finally {
        setIsThinking(false);
      }
    },
    [contractId, isThinking, messages, t]
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

  const hasPreviewData = previewBody.length > 0;
  const showFieldCard = Boolean(awaitingField && !completed);
  const showTextInput = !showFieldCard;
  const showEditPanel = panelMode === "edit";
  const showPreviewPanel = hasPreviewData && panelMode === "preview";

  return (
    <div className="space-y-4">
      {hasPreviewData && (
        <div className="flex justify-end">
          <DraftPanelModeToggle mode={panelMode} onChange={setPanelMode} />
        </div>
      )}

      {showEditPanel && (
        <section className="surface-elevated overflow-hidden rounded-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-4 sm:px-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-3.5" aria-hidden />
              </div>
              <h2 className="text-base font-semibold tracking-tight">{td("pageTitle")}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{td("intro")}</p>
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

          {(isThinking || isResuming) && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-tl-md border border-border/50 bg-card px-4 py-3 shadow-sm">
                <LogoLoader />
              </div>
            </div>
          )}

          {showFieldCard && awaitingField && (
            <ChatFieldCard
              label={awaitingField.label}
              disabled={isThinking || isResuming}
              onSubmit={(value) => void sendMessage(value)}
            />
          )}
        </div>

        {showTextInput && (
          <footer className="space-y-3 border-t border-border/60 bg-card px-4 py-4 sm:px-5">
            <div className="flex items-end gap-2 rounded-xl border border-border/60 bg-muted/30 p-2 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={completed ? t("placeholderAfterDone") : t("placeholder")}
                rows={1}
                disabled={isThinking || isResuming}
                className="min-h-10 flex-1 resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
              />
              <Button
                type="button"
                size="icon"
                className="size-9 shrink-0 rounded-lg"
                onClick={handleSend}
                disabled={!draft.trim() || isThinking || isResuming}
                aria-label={t("send")}
              >
                <ArrowUp />
              </Button>
            </div>
          </footer>
        )}
      </section>
      )}

      {showPreviewPanel && (
        <ContractViewer
          title={previewTitle}
          body={previewBody}
          contractId={contractId}
          highlight={previewHighlight}
          draftPreview={previewInProgress}
          showLawyerRequest={!previewInProgress}
          className="min-h-[28rem]"
        />
      )}
    </div>
  );
}
