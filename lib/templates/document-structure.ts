import type { ContractSegment } from "@/lib/templates/highlight";

export type InlineNode =
  | { kind: "text"; content: string }
  | { kind: "field"; fieldId: string; label: string; value: string };

export type DocumentBlock =
  | { type: "title"; nodes: InlineNode[] }
  | { type: "party"; variant: "entre" | "et"; nodes: InlineNode[] }
  | { type: "preamble"; nodes: InlineNode[] }
  | { type: "article"; number: string; heading: string; children: DocumentBlock[] }
  | { type: "paragraph"; nodes: InlineNode[] }
  | { type: "list-item"; nodes: InlineNode[] }
  | { type: "signature"; nodes: InlineNode[] }
  | { type: "disclaimer"; nodes: InlineNode[] };

const ARTICLE_RE = /^Article\s+(\d+)\s*[—–-]\s*(.+)$/i;
const LIST_RE = /^-\s+/;

function nodesToText(nodes: InlineNode[]): string {
  return nodes.map((n) => (n.kind === "text" ? n.content : n.value)).join("");
}

function segmentsToLines(segments: ContractSegment[]): InlineNode[][] {
  const lines: InlineNode[][] = [];
  let current: InlineNode[] = [];

  function pushLine() {
    if (current.length > 0) {
      lines.push(current);
      current = [];
    }
  }

  for (const segment of segments) {
    if (segment.kind === "field") {
      current.push({
        kind: "field",
        fieldId: segment.fieldId,
        label: segment.label,
        value: segment.value,
      });
      continue;
    }

    const parts = segment.content.split("\n");
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].length > 0) {
        current.push({ kind: "text", content: parts[i] });
      }
      if (i < parts.length - 1) pushLine();
    }
  }

  pushLine();
  return lines;
}

function plainTextToLines(body: string): InlineNode[][] {
  return body.split("\n").map((line) => [{ kind: "text" as const, content: line }]);
}

function classifyLines(lines: InlineNode[][]): DocumentBlock[] {
  const blocks: DocumentBlock[] = [];
  let currentArticle: Extract<DocumentBlock, { type: "article" }> | null = null;
  let titleAssigned = false;

  function flushArticle() {
    if (currentArticle) {
      blocks.push(currentArticle);
      currentArticle = null;
    }
  }

  function addToArticle(block: DocumentBlock) {
    if (!currentArticle) {
      blocks.push(block);
      return;
    }
    currentArticle.children.push(block);
  }

  function mergeLines(start: number): { nodes: InlineNode[]; nextIndex: number } {
    const merged: InlineNode[] = [...lines[start]];
    let j = start + 1;
    while (j < lines.length) {
      const nextText = nodesToText(lines[j]).trim();
      if (!nextText) break;
      if (/^Et\s*:/i.test(nextText) || /^Il a été convenu/i.test(nextText) || ARTICLE_RE.test(nextText)) {
        break;
      }
      merged.push({ kind: "text", content: " " });
      merged.push(...lines[j]);
      j++;
    }
    return { nodes: merged, nextIndex: j };
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const text = nodesToText(line).trim();
    if (!text) continue;

    if (text === "---") {
      flushArticle();
      continue;
    }

    if (/^Document généré/i.test(text)) {
      flushArticle();
      blocks.push({ type: "disclaimer", nodes: line });
      continue;
    }

    if (!titleAssigned && !ARTICLE_RE.test(text) && !/^Entre\s*:/i.test(text)) {
      flushArticle();
      blocks.push({ type: "title", nodes: line });
      titleAssigned = true;
      continue;
    }

    if (/^Entre\s*:/i.test(text)) {
      flushArticle();
      const merged = mergeLines(i);
      blocks.push({ type: "party", variant: "entre", nodes: merged.nodes });
      i = merged.nextIndex - 1;
      continue;
    }

    if (/^Et\s*:/i.test(text)) {
      flushArticle();
      const merged = mergeLines(i);
      blocks.push({ type: "party", variant: "et", nodes: merged.nodes });
      i = merged.nextIndex - 1;
      continue;
    }

    if (/^Il a été convenu/i.test(text)) {
      flushArticle();
      blocks.push({ type: "preamble", nodes: line });
      continue;
    }

    const articleMatch = text.match(ARTICLE_RE);
    if (articleMatch) {
      flushArticle();
      currentArticle = {
        type: "article",
        number: articleMatch[1],
        heading: articleMatch[2].trim(),
        children: [],
      };
      continue;
    }

    if (LIST_RE.test(text)) {
      const nodes: InlineNode[] = [];
      for (const node of line) {
        if (node.kind === "text") {
          nodes.push({ kind: "text", content: node.content.replace(LIST_RE, "") });
        } else {
          nodes.push(node);
        }
      }
      addToArticle({ type: "list-item", nodes });
      continue;
    }

    if (/^Fait en/i.test(text)) {
      flushArticle();
      blocks.push({ type: "signature", nodes: line });
      continue;
    }

    addToArticle({ type: "paragraph", nodes: line });
  }

  flushArticle();
  return blocks;
}

export function buildDocumentBlocks(segments: ContractSegment[]): DocumentBlock[] {
  return classifyLines(segmentsToLines(segments));
}

export function buildDocumentBlocksFromBody(body: string): DocumentBlock[] {
  return classifyLines(plainTextToLines(body));
}

export function collectFieldNodes(blocks: DocumentBlock[]): InlineNode[] {
  const fields: InlineNode[] = [];

  function walk(block: DocumentBlock) {
    if (block.type === "article") {
      for (const child of block.children) walk(child);
      return;
    }

    if ("nodes" in block) {
      for (const node of block.nodes) {
        if (node.kind === "field") fields.push(node);
      }
    }
  }

  for (const block of blocks) walk(block);
  return fields.filter((n): n is Extract<InlineNode, { kind: "field" }> => n.kind === "field");
}
