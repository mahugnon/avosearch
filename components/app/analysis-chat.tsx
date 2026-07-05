"use client";

import { ArrowUp, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { draftChatAction, type AwaitingField } from "@/lib/actions/draft-chat";
import { ContractViewer } from "@/components/contracts/contract-viewer";
import { ChatFieldCard } from "@/components/app/chat-field-card";
import { ChatHistoryPanel } from "@/components/app/chat-history-panel";
import { DraftPanelModeToggle, type DraftPanelMode } from "@/components/app/draft-panel-mode-toggle";
import { LawyerContactPrompt } from "@/components/app/lawyer-contact-prompt";
import { LogoLoader } from "@/components/brand/logo-loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  loadChatThreads,
  titleFromFirstUserMessage,
  upsertChatThread,
  type ChatThread,
  type StoredChatMessage,
} from "@/lib/chat/local-history";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

function toStored(messages: ChatMessage[]): StoredChatMessage[] {
  return messages.map((m) => ({ ...m, at: Date.now() }));
}

function fromStored(messages: StoredChatMessage[]): ChatMessage[] {
  return messages.map(({ id, role, content }) => ({ id, role, content }));
}

function createThread(welcome: string): ChatThread {
  const id = crypto.randomUUID();
  return {
    id,
    title: "Conversation",
    updatedAt: Date.now(),
    messages: [{ id: "welcome", role: "assistant", content: welcome, at: Date.now() }],
  };
}

export function AnalysisChat() {
  const t = useTranslations("chat");
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [contractId, setContractId] = useState<string | undefined>();
  const [contractBody, setContractBody] = useState<string | undefined>();
  const [contractTitle, setContractTitle] = useState<string | undefined>();
  const [draftInProgress, setDraftInProgress] = useState(false);
  const [panelMode, setPanelMode] = useState<DraftPanelMode>("edit");
  const [lawyerInquiry, setLawyerInquiry] = useState<string | undefined>();
  const [awaitingField, setAwaitingField] = useState<AwaitingField | undefined>();
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userHistoryRef = useRef<string[]>([]);
  const hydratedRef = useRef(false);

  const persistThread = useCallback(
    (nextMessages: ChatMessage[], patch?: Partial<ChatThread>) => {
      if (!activeThreadId) return;
      const stored = toStored(nextMessages);
      const thread: ChatThread = {
        id: activeThreadId,
        title: titleFromFirstUserMessage(stored),
        updatedAt: Date.now(),
        messages: stored,
        contractId: patch?.contractId ?? contractId,
        inquiryMessage: patch?.inquiryMessage ?? lawyerInquiry,
        ...patch,
      };
      upsertChatThread(thread);
      setThreads(loadChatThreads());
    },
    [activeThreadId, contractId, lawyerInquiry]
  );

  const resetSessionState = useCallback(() => {
    userHistoryRef.current = [];
    setContractId(undefined);
    setContractBody(undefined);
    setContractTitle(undefined);
    setDraftInProgress(false);
    setPanelMode("edit");
    setLawyerInquiry(undefined);
    setAwaitingField(undefined);
    setError(null);
  }, []);

  const loadThread = useCallback(
    (thread: ChatThread) => {
      setActiveThreadId(thread.id);
      setMessages(fromStored(thread.messages));
      userHistoryRef.current = thread.messages.filter((m) => m.role === "user").map((m) => m.content);
      setContractId(thread.contractId);
      setLawyerInquiry(thread.inquiryMessage);
      setContractBody(undefined);
      setContractTitle(undefined);
      setDraftInProgress(false);
      setPanelMode("edit");
      setAwaitingField(undefined);
      setError(null);
    },
    []
  );

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const stored = loadChatThreads();
    setThreads(stored);
    if (stored[0]) {
      loadThread(stored[0]);
    } else {
      const thread = createThread(t("welcome"));
      setActiveThreadId(thread.id);
      setMessages(fromStored(thread.messages));
      upsertChatThread(thread);
      setThreads(loadChatThreads());
    }
  }, [loadThread, t]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking, lawyerInquiry, awaitingField]);

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

        if (result.contractId) {
          setContractId(result.contractId);
          setLawyerInquiry(undefined);
        }

        if (result.suggestLawyer && result.inquiryMessage) {
          setLawyerInquiry(result.inquiryMessage);
          setContractId(undefined);
          setContractBody(undefined);
          setContractTitle(undefined);
          setDraftInProgress(false);
          setPanelMode("edit");
        }

        if (result.draftPreview) {
          setContractBody(result.draftPreview.body);
          setContractTitle(result.draftPreview.title);
          setDraftInProgress(result.draftPreview.inProgress);
        }

        if (result.completed && result.contractBody) {
          setContractBody(result.contractBody);
          if (result.contractTitle) {
            setContractTitle(result.contractTitle);
          }
          setDraftInProgress(false);
          setPanelMode("preview");
          setAwaitingField(undefined);
        } else if (result.awaitingField) {
          setAwaitingField(result.awaitingField);
        }

        let finalMessages = nextMessages;
        if (result.assistantMessage) {
          finalMessages = [
            ...nextMessages,
            { id: crypto.randomUUID(), role: "assistant", content: result.assistantMessage },
          ];
          setMessages(finalMessages);
        }

        persistThread(finalMessages, {
          contractId: result.contractId ?? contractId,
          inquiryMessage: result.inquiryMessage ?? lawyerInquiry,
        });
      } catch {
        setError(t("errors.generic"));
      } finally {
        setIsThinking(false);
      }
    },
    [contractId, isThinking, lawyerInquiry, messages, persistThread, t]
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

  function handleDeclineLawyer() {
    setLawyerInquiry(undefined);
    const finalMessages: ChatMessage[] = [
      ...messages,
      { id: crypto.randomUUID(), role: "assistant", content: t("lawyerOffer.declined") },
    ];
    setMessages(finalMessages);
    persistThread(finalMessages, { inquiryMessage: undefined });
  }

  function handleNewConversation() {
    resetSessionState();
    const thread = createThread(t("welcome"));
    upsertChatThread(thread);
    setThreads(loadChatThreads());
    setActiveThreadId(thread.id);
    setMessages(fromStored(thread.messages));
  }

  function handleSelectThread(id: string) {
    const thread = threads.find((item) => item.id === id);
    if (thread) loadThread(thread);
  }

  const hasPreviewData = Boolean(contractBody && contractTitle && contractId);
  const showFieldCard = Boolean(awaitingField && contractId && !lawyerInquiry && draftInProgress);
  const showTextInput = !showFieldCard && !lawyerInquiry;
  const showEditPanel = !hasPreviewData || panelMode === "edit";
  const showPreviewPanel = hasPreviewData && panelMode === "preview";

  return (
    <div className="space-y-4">
      <ChatHistoryPanel
        threads={threads}
        activeThreadId={activeThreadId}
        onSelect={handleSelectThread}
        onNew={handleNewConversation}
      />

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
                  <LogoLoader />
                </div>
              </div>
            )}

            {showFieldCard && awaitingField && (
              <ChatFieldCard
                label={awaitingField.label}
                disabled={isThinking}
                onSubmit={(value) => void sendMessage(value)}
              />
            )}

            {lawyerInquiry && (
              <LawyerContactPrompt inquiryMessage={lawyerInquiry} onDecline={handleDeclineLawyer} />
            )}
          </div>

          {showTextInput && (
            <footer className="space-y-3 border-t border-border/60 bg-card px-4 py-4 sm:px-5">
              <div className="flex items-end gap-2 rounded-xl border border-border/60 bg-muted/30 p-2 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10">
                <Textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={draftInProgress ? t("placeholder") : t("placeholderAfterDone")}
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
          )}
        </section>
      )}

      {showPreviewPanel && (
        <ContractViewer
          title={contractTitle!}
          body={contractBody!}
          contractId={contractId}
          draftPreview={draftInProgress}
          showLawyerRequest={!draftInProgress}
          className="min-h-[28rem]"
        />
      )}
    </div>
  );
}
