import type { Block, TableBlock, BlockDocument, InlineNode } from "@app-types/game";
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
  if (block.type === 'table') return buildTable(block);
  if (block.type === 'moralityPairs') return buildReactPlaceholder(block.id, 'morality-pairs');

  const tagMap: Record<string, string> = {
    paragraph: 'p',
    h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
    listItemOrdered: 'li',
    listItemUnordered: 'li',
    blockquote: 'blockquote',
  };

  const el = document.createElement(tagMap[block.type]);
  el.id = block.id;
  for (const node of block.content) {
    el.appendChild(buildInlineNode(node));
  }

  return el;
}

function buildReactPlaceholder(id: string, componentName: string): HTMLElement {
  const el = document.createElement('div');
  el.id = id;
  el.dataset.reactComponent = componentName;
  return el;
}

function buildTable(block: TableBlock): HTMLTableElement {
  const table = document.createElement('table');
  table.id = block.id;
  const tbody = document.createElement('tbody');
  for (const row of block.rows) {
    const tr = document.createElement('tr');
    tr.id = row.id;
    for (const cell of row.cells) {
      const td = document.createElement('td');
      td.id = cell.id;
      for (const node of cell.content) {
        td.appendChild(buildInlineNode(node));
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  return table;
}

function createTableDom(rows: number, cols: number): HTMLTableElement {
  const table = document.createElement('table');
  table.id = crypto.randomUUID();
  const tbody = document.createElement('tbody');
  for (let r = 0; r < rows; r++) {
    const tr = document.createElement('tr');
    tr.id = crypto.randomUUID();
    for (let c = 0; c < cols; c++) {
      const td = document.createElement('td');
      td.id = crypto.randomUUID();
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  return table;
}

export function insertMoralityPairsBlock(
  lastFocusedRef: React.RefObject<HTMLElement | null>,
  contentsRef: React.RefObject<HTMLElement | null>,
  dispatch: (cmd: EditorCommand) => void
) {
  const anchor = lastFocusedRef.current;
  const el = buildReactPlaceholder(crypto.randomUUID(), 'morality-pairs');
  if (anchor) {
    anchor.insertAdjacentElement('afterend', el);
    dispatch({ type: 'element-created', id: el.id, tag: 'morality-pairs', afterId: anchor.id || null, content: '' });
  } else if (contentsRef.current) {
    const lastSibling = contentsRef.current.lastElementChild as HTMLElement | null;
    contentsRef.current.appendChild(el);
    dispatch({ type: 'element-created', id: el.id, tag: 'morality-pairs', afterId: lastSibling?.id || null, content: '' });
  }
}

export function insertTable(
  lastFocusedRef: React.RefObject<HTMLElement | null>,
  contentsRef: React.RefObject<HTMLElement | null>,
  dispatch: (cmd: EditorCommand) => void
) {
  const anchor = lastFocusedRef.current;
  const table = createTableDom(3, 3);
  table.contentEditable = 'true';
  if (anchor) {
    anchor.insertAdjacentElement('afterend', table);
    dispatch({ type: 'element-created', id: table.id, tag: 'table', afterId: anchor.id || null, content: '' });
  } else if (contentsRef.current) {
    const lastSibling = contentsRef.current.lastElementChild as HTMLElement | null;
    contentsRef.current.appendChild(table);
    dispatch({ type: 'element-created', id: table.id, tag: 'table', afterId: lastSibling?.id || null, content: '' });
  }
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

export function changeBlockType(lastFocusedRef: React.RefObject<HTMLElement | null>, newTag: string, dispatch: (cmd: EditorCommand) => void) {
  const el = lastFocusedRef.current;
  if (!el) return;
  const beforeTag = el.tagName.toLowerCase();
  if (beforeTag === newTag) return;
  const newEl = document.createElement(newTag);
  newEl.id = el.id;
  newEl.contentEditable = el.contentEditable;
  newEl.className = el.className;
  newEl.innerHTML = el.innerHTML;
  el.replaceWith(newEl);
  lastFocusedRef.current = newEl;
  dispatch({ type: 'element-changed-type', id: newEl.id, before: beforeTag, after: newTag });
};

export function clearFocusedBlock(lastFocusedRef: React.RefObject<HTMLElement | null>, lastFocusedCellRef?: React.RefObject<HTMLElement | null>) {
  if (lastFocusedRef.current) {
    lastFocusedRef.current.classList.remove('be-focused');
    lastFocusedRef.current = null;
  }
  if (lastFocusedCellRef?.current) {
    lastFocusedCellRef.current.classList.remove('be-focused');
    lastFocusedCellRef.current = null;
  }
};

/// --- EVENTS --- ///
export function handleKeyUp(
  e: React.KeyboardEvent<HTMLElement>,
  modifiers: {
    alt: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    ctrl: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    shift: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  }
) {
  // console.log(`---> handleKeyUp(${e.key})`);
  const target = e.target as HTMLElement;
  const [isAlt, setAlt] = modifiers.alt;
  const [isCtrl, setCtrl] = modifiers.ctrl;
  const [isShift, setShift] = modifiers.shift;

  // Skip if the event fired on the section itself rather than a block element
  if (target === e.currentTarget) return;

  // Let native inputs handle their own keyboard events
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;

  // Capture modifier keys
  if (["Alt", "Ctrl", "Shift"].includes(e.key)) {
    switch (e.key) {
      case "Alt":
        setAlt(false);
        break;
      case "Ctrl":
        setCtrl(false);
        break;
      case "Shift":
        setShift(false);
        break;
    }
    return;
  }
}

export function handleKeyDown(
  e: React.KeyboardEvent<HTMLElement>,
  modifiers: {
    alt: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    ctrl: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    shift: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  },
  dispatch: (cmd: EditorCommand) => void
) {
  console.log(`---> handleKeyDown(${e.key})`);
  const target = e.target as HTMLElement;
  // console.log(target);
  const [isAlt, setAlt] = modifiers.alt;
  const [isCtrl, setCtrl] = modifiers.ctrl;
  const [isShift, setShift] = modifiers.shift;

  // Skip if the event fired on the section itself rather than a block element
  if (target === e.currentTarget) return;

  // Let native inputs handle their own keyboard events
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;

  // Capture modifier keys
  if (["Alt", "Ctrl", "Shift"].includes(e.key)) {
    switch (e.key) {
      case "Alt":
        setAlt(true);
        break;
      case "Ctrl":
        setCtrl(true);
        break;
      case "Shift":
        setShift(true);
        break;
    }
    return;
  }

  const elementType = target.tagName.toLowerCase();

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);

  switch (e.key) {
    case "ArrowDown": {
      if (!isInTable(target)) break;
      const cell = getCellFromSelection(sel);
      if (!cell) break;
      const below = getAdjacentCell(cell, 'down');
      if (!below) break;
      e.preventDefault();
      focusCellStart(below);
      break;
    }
    case "ArrowLeft": {
      if (!isInTable(target)) break;
      const cell = getCellFromSelection(sel);
      if (!cell) break;
      if (!isAtCellStart(sel, cell)) break;
      const prev = getAdjacentCell(cell, 'left');
      if (!prev) break;
      e.preventDefault();
      focusCellEnd(prev);
      break;
    }
    case "ArrowRight": {
      if (!isInTable(target)) break;
      const cell = getCellFromSelection(sel);
      if (!cell) break;
      if (!isAtCellEnd(sel, cell)) break;
      const next = getAdjacentCell(cell, 'right');
      if (!next) break;
      e.preventDefault();
      focusCellStart(next);
      break;
    }
    case "ArrowUp": {
      if (!isInTable(target)) break;
      const cell = getCellFromSelection(sel);
      if (!cell) break;
      const above = getAdjacentCell(cell, 'up');
      if (!above) break;
      e.preventDefault();
      focusCellStart(above);
      break;
    }
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
        dispatch({ type: 'element-changed-contents', id: prev.id, before: prevBefore, after: prev.innerHTML });
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
function isInTable(element: HTMLElement): boolean {
  return element.tagName === 'TABLE';
}

function getCellFromSelection(sel: Selection): HTMLTableCellElement | null {
  let node: Node | null = sel.focusNode;
  while (node) {
    if (node instanceof HTMLTableCellElement) return node;
    node = node.parentNode;
  }
  return null;
}

function isAtCellStart(sel: Selection, cell: HTMLTableCellElement): boolean {
  const range = sel.getRangeAt(0);
  if (!range.collapsed) return false;
  if (range.startOffset !== 0) return false;
  let node: Node = range.startContainer;
  while (node !== cell) {
    if (node.previousSibling) return false;
    if (!node.parentNode) return false;
    node = node.parentNode;
  }
  return true;
}

function isAtCellEnd(sel: Selection, cell: HTMLTableCellElement): boolean {
  const range = sel.getRangeAt(0);
  if (!range.collapsed) return false;
  const container = range.endContainer;
  if (container.nodeType === Node.TEXT_NODE) {
    if (range.endOffset !== (container.textContent?.length ?? 0)) return false;
  } else {
    if (range.endOffset !== container.childNodes.length) return false;
  }
  let node: Node = container;
  while (node !== cell) {
    if (node.nextSibling) return false;
    if (!node.parentNode) return false;
    node = node.parentNode;
  }
  return true;
}

function focusCellStart(cell: HTMLTableCellElement) {
  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  range.setStart(cell, 0);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

function focusCellEnd(cell: HTMLTableCellElement) {
  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  range.selectNodeContents(cell);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

function getAdjacentCell(cell: HTMLTableCellElement, direction: 'up' | 'down' | 'left' | 'right'): HTMLTableCellElement | null {
  const row = cell.parentElement as HTMLTableRowElement | null;
  if (!row) return null;
  const cellIndex = Array.from(row.cells).indexOf(cell);

  switch (direction) {
    case 'left': {
      if (cellIndex > 0) return row.cells[cellIndex - 1];
      // Wrap to last cell of previous row
      const prevRow = row.previousElementSibling as HTMLTableRowElement | null;
      return prevRow ? prevRow.cells[prevRow.cells.length - 1] : null;
    }
    case 'right': {
      if (cellIndex < row.cells.length - 1) return row.cells[cellIndex + 1];
      // Wrap to first cell of next row
      const nextRow = row.nextElementSibling as HTMLTableRowElement | null;
      return nextRow ? nextRow.cells[0] : null;
    }
    case 'up': {
      const prevRow = row.previousElementSibling as HTMLTableRowElement | null;
      return prevRow && cellIndex < prevRow.cells.length ? prevRow.cells[cellIndex] : null;
    }
    case 'down': {
      const nextRow = row.nextElementSibling as HTMLTableRowElement | null;
      return nextRow && cellIndex < nextRow.cells.length ? nextRow.cells[cellIndex] : null;
    }
  }
}
