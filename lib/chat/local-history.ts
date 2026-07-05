export type StoredChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  at: number;
};

export type ChatThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: StoredChatMessage[];
  contractId?: string;
  inquiryMessage?: string;
};

const STORAGE_KEY = "avosearch-chat-threads";
const MAX_THREADS = 20;

function readThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatThread[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeThreads(threads: ChatThread[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads.slice(0, MAX_THREADS)));
}

export function loadChatThreads(): ChatThread[] {
  return readThreads().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function upsertChatThread(thread: ChatThread) {
  const threads = readThreads().filter((item) => item.id !== thread.id);
  threads.unshift(thread);
  writeThreads(threads);
}

export function deleteChatThread(id: string) {
  writeThreads(readThreads().filter((item) => item.id !== id));
}

export function titleFromFirstUserMessage(messages: StoredChatMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "Conversation";
  const trimmed = first.content.trim();
  if (trimmed.length <= 48) return trimmed;
  return `${trimmed.slice(0, 45)}…`;
}
