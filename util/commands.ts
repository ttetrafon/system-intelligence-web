import { useCallback, useRef } from 'react';
import type { EditorCommand } from '@app-types/editor';
import type { Block, ContentBlock, BlockDocument, InlineNode } from '@app-types/game';
import type { AnyDocumentCommand, documentCommand } from '@app-types/requests';

export function useCommandHistory() {
  const history = useRef<EditorCommand[]>([]);
  const pointer = useRef(-1);

  const push = useCallback((cmd: EditorCommand) => {
    // Discard any commands after the current pointer (redo branch)
    history.current = history.current.slice(0, pointer.current + 1);
    history.current.push(cmd);
    pointer.current = history.current.length - 1;
    console.log("--- --- --- --- --- --- --- --- --- --- ---")
    console.log(history.current);
  }, []);

  const undo = useCallback((): EditorCommand | null => {
    if (pointer.current < 0) return null;
    return history.current[pointer.current--];
  }, []);

  const redo = useCallback((): EditorCommand | null => {
    if (pointer.current >= history.current.length - 1) return null;
    return history.current[++pointer.current];
  }, []);

  // Returns all commands up to and including the current pointer, for server transmission
  const getApplied = useCallback((): EditorCommand[] => {
    return history.current.slice(0, pointer.current + 1);
  }, []);

  const clear = useCallback(() => {
    history.current = [];
    pointer.current = 0;
  }, []);

  return { push, undo, redo, getApplied, clear };
}

function tagToBlockType(tag: string, fallback: ContentBlock['type'] = 'listItemUnordered'): ContentBlock['type'] {
  const map: Record<string, ContentBlock['type']> = {
    p: 'paragraph',
    h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
    blockquote: 'blockquote',
    li: fallback,
  };
  return map[tag] ?? 'paragraph';
}

function extractInlineNodes(node: Node, bold = false, italic = false): InlineNode[] {
  const nodes: InlineNode[] = [];
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent ?? '';
      if (text) nodes.push({ text, ...(bold && { bold }), ...(italic && { italic }) });
    } else if (child instanceof HTMLElement) {
      const isBold = bold || child.tagName === 'STRONG';
      const isItalic = italic || child.tagName === 'EM';
      nodes.push(...extractInlineNodes(child, isBold, isItalic));
    }
  }
  return nodes;
}

function parseInlineNodes(html: string): InlineNode[] {
  const el = document.createElement('div');
  el.innerHTML = html;
  return extractInlineNodes(el);
}

/**
 * Converts a single EditorCommand into a single AnyDocumentCommand for immediate WebSocket dispatch.
 * Returns null if the command cannot be converted (e.g. table content change).
 */
export function buildSingleCommand(
  cmd: EditorCommand,
  blockDocument: BlockDocument,
  context: documentCommand,
): AnyDocumentCommand | null {
  const workingOrder = [...blockDocument.order];
  const workingBlocks: Record<string, Block> = { ...blockDocument.blocks };

  switch (cmd.type) {
    case 'element-created': {
      const afterIndex = cmd.afterId ? workingOrder.indexOf(cmd.afterId) : -1;
      const position = afterIndex + 1;
      let block: Block;
      if (cmd.tag === 'table') {
        block = {
          id: cmd.id,
          type: 'table',
          rows: Array.from({ length: 3 }, () => ({
            id: crypto.randomUUID(),
            cells: Array.from({ length: 3 }, () => ({
              id: crypto.randomUUID(),
              content: [],
            })),
          })),
        };
      } else {
        const afterBlock = cmd.afterId ? workingBlocks[cmd.afterId] : null;
        const liType = afterBlock?.type === 'listItemOrdered' ? 'listItemOrdered' : 'listItemUnordered';
        block = {
          id: cmd.id,
          type: tagToBlockType(cmd.tag, liType),
          content: parseInlineNodes(cmd.content),
        };
      }
      return { ...context, block, position };
    }
    case 'element-deleted': {
      return { ...context, blockId: cmd.id };
    }
    case 'element-changed-contents': {
      const existing = workingBlocks[cmd.id];
      if (!existing || existing.type === 'table') return null;
      const updatedBlock: ContentBlock = {
        id: cmd.id,
        type: existing.type,
        content: parseInlineNodes(cmd.after),
      };
      return { ...context, updatedBlock };
    }
    case 'element-changed-type': {
      const existing = workingBlocks[cmd.id];
      if (!existing || existing.type === 'table') return null;
      const updatedBlock: ContentBlock = {
        id: cmd.id,
        type: tagToBlockType(cmd.after),
        content: existing.content,
      };
      return { ...context, updatedBlock };
    }
    case 'order-changed': {
      return { ...context, updatedOrder: cmd.after };
    }
  }
}

