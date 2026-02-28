export async function convertMkToHtml(text: string, target: HTMLElement) {
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
      html += `<h${level}>${escapeHtml(headingMatch[2])}</h${level}>`;
      continue;
    }

    // Unordered list: - or *
    const ulMatch = line.match(/^[\-\*]\s+(.+)$/);
    if (ulMatch) {
      if (inList === "ol") { html += "</ol>"; inList = null; }
      if (!inList) { html += "<ul>"; inList = "ul"; }
      html += `<li>${escapeHtml(ulMatch[1])}</li>`;
      continue;
    }

    // Ordered list: 1. 2. etc.
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (inList === "ul") { html += "</ul>"; inList = null; }
      if (!inList) { html += "<ol>"; inList = "ol"; }
      html += `<li>${escapeHtml(olMatch[1])}</li>`;
      continue;
    }

    // Close any open list before non-list content
    if (inList) { html += `</${inList}>`; inList = null; }

    // Blank lines are skipped
    if (line.trim() === "") continue;

    // Plain text as paragraph
    html += `<p>${escapeHtml(line)}</p>`;
  }

  // Close any trailing open list
  if (inList) { html += `</${inList}>`; }

  target.innerHTML = html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
