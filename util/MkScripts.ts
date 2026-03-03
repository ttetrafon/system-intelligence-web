import { mkMarkers } from "./constants";

export async function convertMkToHtml(text: string, target: HTMLElement, context: Record<string, unknown> = {}) {
  target.innerHTML = "";

  const lines = text.split("\n");
  let html = "";
  let inList: "ul" | "ol" | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headings: # through ######
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (inList) { html += `</${inList}>`; inList = null; }
      const level = headingMatch[1].length;
      const { html: inner, lineClasses } = renderInline(headingMatch[2]);
      html += `<h${level}${cls(lineClasses)}>${inner}</h${level}>`;
      continue;
    }

    // Quote
    const quoteMatch = line.match(/^(\>)\s+(.+)$/);
    if (quoteMatch) {
      if (inList) { html += `</${inList}>`; inList = null; }
      const { html: inner, lineClasses } = renderInline(quoteMatch[2]);
      html += `<blockquote${cls(lineClasses)}>${inner}</blockquote>`;
      continue;
    }

    // Table: current line starts with | and next line is a separator (|---|)
    if (line.startsWith('|') && i + 1 < lines.length && /^\|[\s\-:]+\|/.test(lines[i + 1])) {
      if (inList) { html += `</${inList}>`; inList = null; }
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      i--;
      html += renderTable(tableLines, context);
      continue;
    }

    // Unordered list: - or *
    const ulMatch = line.match(/^[\-\*]\s+(.+)$/);
    if (ulMatch) {
      if (inList === "ol") { html += "</ol>"; inList = null; }
      if (!inList) { html += "<ul>"; inList = "ul"; }
      const { html: inner, lineClasses } = renderInline(ulMatch[1]);
      html += `<li${cls(lineClasses)}>${inner}</li>`;
      continue;
    }

    // Ordered list: 1. 2. etc.
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (inList === "ul") { html += "</ul>"; inList = null; }
      if (!inList) { html += "<ol>"; inList = "ol"; }
      const { html: inner, lineClasses } = renderInline(olMatch[1]);
      html += `<li${cls(lineClasses)}>${inner}</li>`;
      continue;
    }

    // Close any open list before non-list content
    if (inList) { html += `</${inList}>`; inList = null; }

    // Blank lines are skipped
    if (line.trim() === "") continue;

    // Plain text as paragraph
    const { html: inner, lineClasses } = renderInline(line);
    html += `<p${cls(lineClasses)}>${inner}</p>`;
  }

  // Close any trailing open list
  if (inList) { html += `</${inList}>`; }

  target.innerHTML = html;
}

function renderTable(lines: string[], context: Record<string, unknown>): string {
  if (lines.length < 2) return '';

  const parseRow = (line: string): string[] =>
    line.split('|').slice(1, -1).map(c => c.trim());

  const headers = parseRow(lines[0]);
  // lines[1] is the separator row — skip it
  const rawRows = lines.slice(2).map(parseRow);

  // First pass: resolve literal cells; formula cells start as null
  const resolved: (number | string | null)[][] = rawRows.map(row =>
    row.map(cell => {
      if (cell.startsWith('=')) return null;
      const n = Number(cell);
      return cell !== '' && !isNaN(n) ? n : cell;
    })
  );

  // Second pass: resolve formula cells left-to-right, top-to-bottom
  for (let r = 0; r < rawRows.length; r++) {
    for (let c = 0; c < rawRows[r].length; c++) {
      if (rawRows[r][c].startsWith('=')) {
        resolved[r][c] = evalFormula(rawRows[r][c].slice(1), resolved, context);
      }
    }
  }

  const thead = `<thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${resolved.map(row =>
    `<tr>${row.map(v => `<td>${escapeHtml(String(v ?? ''))}</td>`).join('')}</tr>`
  ).join('')}</tbody>`;

  return `<div class="table-wrap"><table>${thead}${tbody}</table></div>`;
}

// Evaluates a formula expression string, substituting {var.path} and A1-style cell refs
function evalFormula(
  expr: string,
  cells: (number | string | null)[][],
  context: Record<string, unknown>
): number | string {
  // Replace {var.path} references with their numeric value from context
  const withVars = expr.replace(/\{([\w.]+)\}/g, (_, path) => {
    const val = resolvePath(context, path);
    return val !== undefined ? String(val) : '0';
  });

  // Replace cell references like A1, B3 (column A–Z, row 1-indexed from data rows)
  const withCells = withVars.replace(/\b([A-Z])(\d+)\b/g, (_, col, row) => {
    const colIdx = col.charCodeAt(0) - 65; // A=0, B=1, …
    const rowIdx = parseInt(row, 10) - 1;  // 1-indexed → 0-indexed
    const val = cells[rowIdx]?.[colIdx];
    return typeof val === 'number' ? String(val) : '0';
  });

  try {
    return evalMath(withCells);
  } catch {
    return '#ERR';
  }
}

// Resolves a dot-separated path through a nested object, returning the value if numeric
function resolvePath(obj: Record<string, unknown>, path: string): number | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'number' ? current : undefined;
}

// Safe recursive-descent math evaluator
// Grammar: expr = term ((+|-) term)*
//          term = factor ((*|/) factor)*
//          factor = '-' factor | '(' expr ')' | fn '(' args ')' | number
function evalMath(expr: string): number {
  const tokens = tokenize(expr);
  let pos = 0;

  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  function parseExpr(): number {
    let val = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = consume();
      const right = parseTerm();
      val = op === '+' ? val + right : val - right;
    }
    return val;
  }

  function parseTerm(): number {
    let val = parseFactor();
    while (peek() === '*' || peek() === '/') {
      const op = consume();
      const right = parseFactor();
      val = op === '*' ? val * right : val / right;
    }
    return val;
  }

  function parseFactor(): number {
    const token = peek();

    if (token === '-') { consume(); return -parseFactor(); }

    if (token === '(') {
      consume();
      const val = parseExpr();
      consume(); // ')'
      return val;
    }

    // Function call: floor(...), ceil(...), round(...), abs(...), max(...), min(...)
    if (typeof token === 'string' && /^[a-z]+$/.test(token)) {
      const name = consume();
      consume(); // '('
      const args: number[] = [parseExpr()];
      while (peek() === ',') { consume(); args.push(parseExpr()); }
      consume(); // ')'
      switch (name) {
        case 'floor': return Math.floor(args[0]);
        case 'ceil': return Math.ceil(args[0]);
        case 'round': return Math.round(args[0]);
        case 'abs': return Math.abs(args[0]);
        case 'max': return Math.max(...args);
        case 'min': return Math.min(...args);
        default: throw new Error(`Unknown function: ${name}`);
      }
    }

    // Number literal
    return parseFloat(consume());
  }

  return parseExpr();
}

function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < expr.length) {
    if (/\s/.test(expr[i])) { i++; continue; }
    if (/[\d.]/.test(expr[i])) {
      let num = '';
      while (i < expr.length && /[\d.]/.test(expr[i])) num += expr[i++];
      tokens.push(num);
    } else if (/[a-z]/i.test(expr[i])) {
      let name = '';
      while (i < expr.length && /[a-z]/i.test(expr[i])) name += expr[i++];
      tokens.push(name.toLowerCase());
    } else {
      tokens.push(expr[i++]);
    }
  }
  return tokens;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

type InlineSegment = { text: string; bold: boolean; italic: boolean; underline: boolean; strike: boolean };

function parseInline(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let bold = false, italic = false, underline = false, strike = false;
  let i = 0, buf = '';

  const flush = () => {
    if (buf) { segments.push({ text: buf, bold, italic, underline, strike }); buf = ''; }
  };

  while (i < text.length) {
    if (text.startsWith(mkMarkers.bold, i)) { flush(); bold = !bold; i += 2; }
    else if (text.startsWith(mkMarkers.strikethrough, i)) { flush(); strike = !strike; i += 2; }
    else if (text[i] === mkMarkers.underlined) { flush(); underline = !underline; i++; }
    else if (text[i] === mkMarkers.italic) { flush(); italic = !italic; i++; }
    else { buf += text[i++]; }
  }
  flush();
  return segments;
}

function renderInline(text: string): { html: string; lineClasses: string[] } {
  const segments = parseInline(text);
  const nonEmpty = segments.filter(s => s.text.length > 0);

  const getClasses = (s: InlineSegment): string[] => [
    ...(s.bold ? ['mk-bold'] : []),
    ...(s.italic ? ['mk-italic'] : []),
    ...(s.underline ? ['mk-underline'] : []),
    ...(s.strike ? ['mk-strike'] : []),
  ];

  // If every non-empty segment shares the same formatting, promote it to a line-level class
  // so the parent element gets the class instead of a wrapper span.
  if (nonEmpty.length > 0) {
    const firstClasses = getClasses(nonEmpty[0]);
    const allSame = nonEmpty.every(s => {
      const c = getClasses(s);
      return c.length === firstClasses.length && c.every((v, j) => v === firstClasses[j]);
    });
    if (allSame && firstClasses.length > 0) {
      return { html: escapeHtml(nonEmpty.map(s => s.text).join('')), lineClasses: firstClasses };
    }
  }

  const html = segments.map(s => {
    const classes = getClasses(s);
    const escaped = escapeHtml(s.text);
    return classes.length > 0 ? `<span class="${classes.join(' ')}">${escaped}</span>` : escaped;
  }).join('');

  return { html, lineClasses: [] };
}

function cls(classes: string[]): string {
  return classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
}
