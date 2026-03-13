import type { Block, BlockDocument, InlineNode } from "@app-types/game";
import type { EditorCommand } from "@app-types/editor";

/// --- DOM --- ///
export async function buildHtml(blockDocument: BlockDocument): Promise<DocumentFragment> {
  const fragment = document.createDocumentFragment();

  for (const id of blockDocument.order) {
    const block = blockDocument.blocks[id];
    if (!block) continue;
    fragment.appendChild(buildBlock(block));
  }

  return fragment;
}

function buildBlock(block: Block): HTMLElement {
  const tagMap: Record<Block['type'], string> = {
    paragraph: 'p',
    h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
    listItemOrdered: 'li',
    listItemUnordered: 'li',
    blockquote: 'blockquote',
  };

  const el = document.createElement(tagMap[block.type]);
  el.id = block.id;
  // Make this editable if needed.

  for (const node of block.content) {
    el.appendChild(buildInlineNode(node));
  }

  return el;
}

function buildInlineNode(node: InlineNode): Node {
  const text = document.createTextNode(node.text);
  if (!node.bold && !node.italic) return text;

  let wrapper: HTMLElement | undefined;
  if (node.bold) {
    wrapper = document.createElement('strong');
    wrapper.appendChild(text);
  }
  if (node.italic) {
    const em = document.createElement('em');
    em.appendChild(wrapper ?? text);
    wrapper = em;
  }
  return wrapper!;
}

/// --- EVENTS --- ///
export function handleKeyUp(e: React.KeyboardEvent<HTMLElement>) {
  console.log(`---> handleKeyUp(${e.key})`);
}

export function handleKeyDown(e: React.KeyboardEvent<HTMLElement>, dispatch: (cmd: EditorCommand) => void) {
  console.log(`---> handleKeyDown(${e.key})`);
  const target = e.target as HTMLElement;

  // Skip if the event fired on the section itself rather than a block element
  if (target === e.currentTarget) return;

  const elementType = target.tagName.toLowerCase();

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);

  switch (e.key) {
    case "Backspace": {
      // Not at the beginning of the line — let the browser handle it normally
      if (!isAtStart(range, target)) return;

      e.preventDefault();

      const parent = target.parentElement;

      // Only element in the document — nothing to merge into
      if (!parent || parent.children.length <= 1) return;

      const prev = target.previousElementSibling as HTMLElement | null;
      if (!prev) return;

      // Save cursor position at the end of the previous element (the join point)
      const joinRange = document.createRange();
      joinRange.selectNodeContents(prev);
      joinRange.collapse(false);

      if (target.textContent === '') {
        // Empty line: just remove it
        dispatch({ type: 'element-deleted', id: target.id, tag: elementType, afterId: prev.id || null, content: '' });
        target.remove();
      } else {
        // Non-empty line: capture content before the merge, then move into previous element
        const targetContent = target.innerHTML;
        const prevBefore = prev.innerHTML;
        while (target.firstChild) {
          prev.appendChild(target.firstChild);
        }
        target.remove();
        dispatch({ type: 'element-deleted', id: target.id, tag: elementType, afterId: prev.id || null, content: targetContent });
        dispatch({ type: 'element-changed', id: prev.id, before: prevBefore, after: prev.innerHTML });
      }

      sel.removeAllRanges();
      sel.addRange(joinRange);
      break;
    }
    case "Enter": {
      e.preventDefault();

      const parent = target.parentElement;
      if (!parent) return;

      // Headings drop back to paragraph; everything else continues as the same type
      const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
      const newTag = headingTags.includes(elementType) ? 'p' : elementType;
      const newElement = document.createElement(newTag);
      newElement.id = crypto.randomUUID();
      newElement.contentEditable = 'true';

      // Extract everything after the cursor and place it in the new element
      if (target.lastChild) {
        const afterRange = document.createRange();
        afterRange.setStart(range.endContainer, range.endOffset);
        afterRange.setEndAfter(target.lastChild);
        newElement.appendChild(afterRange.extractContents());
      }

      target.insertAdjacentElement('afterend', newElement);
      dispatch({ type: 'element-created', id: newElement.id, tag: newTag, afterId: target.id || null, content: newElement.innerHTML });

      // Move cursor to the start of the new element
      const newRange = document.createRange();
      newRange.setStart(newElement, 0);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      break;
    }
  }
}

function isAtStart(range: Range, element: HTMLElement): boolean {
  if (range.startOffset !== 0) return false;
  let node: Node = range.startContainer;
  while (node !== element) {
    if (node.previousSibling) return false;
    if (!node.parentNode) return false;
    node = node.parentNode;
  }
  return true;
}
