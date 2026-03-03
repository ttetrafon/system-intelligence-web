import { useEffect, useRef, useState } from "react";
import { MkButton } from "./MkButton";
import { MkToolbarSeparator } from "./MkToolbarSeparator";
import { convertMkToHtml } from "util/MkScripts";
import { useGameSystem } from "~/context/GameSystemContext";
import { mkMarkers } from "util/constants";

export interface MarkdownEditorProps {
  col?: boolean,
  editable: boolean,
  editRows?: number,
  dataSystem: string,
  dataPath: string,
  dataProperty: string,
  data: string,
  dataKey: string,
}

export function MarkdownEditor({ editRows = 15, ...props }: MarkdownEditorProps) {
  const renderRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { data: contextData } = useGameSystem();
  const renderData = props.dataKey.split('.').reduce<unknown>(
    (obj, key) => (obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[key] : undefined),
    contextData
  ) as string | undefined;

  useEffect(() => {
    if (renderRef.current)
      convertMkToHtml(renderData ?? '', renderRef.current, contextData as unknown as Record<string, unknown> ?? undefined);
  }, [renderData, contextData]);

  const confirmChanges = async () => {
    if (renderRef.current)
      convertMkToHtml(props.data, renderRef.current);

    if (!textareaRef.current) return;
    await fetch(`/api/game-system/${props.dataSystem}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataPath: props.dataPath,
        dataProperty: props.dataProperty,
        data: textareaRef.current.value,
        dataKey: props.dataKey,
      }),
    });

    setIsEditing(false);
  };

  const previewChanges = () => {
    if (textareaRef.current && renderRef.current)
      convertMkToHtml(textareaRef.current.value, renderRef.current);
  };

  const cancelChanges = () => {
    if (textareaRef.current)
      textareaRef.current.value = props.data;
    if (renderRef.current)
      convertMkToHtml(props.data, renderRef.current);

    setIsEditing(false);
  }

  const insertMarkdownSymbol = (symbol: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { value, selectionStart } = ta;
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const prefix = symbol + ' ';
    if (value.startsWith(prefix, lineStart)) {
      ta.value = value.slice(0, lineStart) + value.slice(lineStart + prefix.length);
      const newPos = Math.max(lineStart, selectionStart - prefix.length);
      ta.setSelectionRange(newPos, newPos);
    } else {
      ta.value = value.slice(0, lineStart) + prefix + value.slice(lineStart);
      const newPos = selectionStart + prefix.length;
      ta.setSelectionRange(newPos, newPos);
    }
    ta.focus();
  }

  const insertMarkdownMarker = (marker: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { value, selectionStart, selectionEnd } = ta;
    const hasSelection = selectionStart !== selectionEnd;

    // True if a line is wrapped by exactly one marker pair with no nested markers inside.
    const isMarkedLine = (line: string) =>
      line.startsWith(marker) && line.endsWith(marker) &&
      line.length >= marker.length * 2 &&
      !line.slice(marker.length, line.length - marker.length).includes(marker);

    if (hasSelection) {
      const selected = value.slice(selectionStart, selectionEnd);
      const lines = selected.split('\n');

      // Case 1: the selected text itself has markers on each line (e.g. user selected "**text**").
      if (lines.every(isMarkedLine)) {
        const unmarked = lines.map(line => line.slice(marker.length, line.length - marker.length)).join('\n');
        ta.value = value.slice(0, selectionStart) + unmarked + value.slice(selectionEnd);
        ta.setSelectionRange(selectionStart, selectionStart + unmarked.length);
        ta.focus();
        return;
      }

      // Case 2: the full lines spanning the selection are all singly marked (user selected
      // content without the outer markers, e.g. selected "text" inside "**text**").
      const selStartLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const selEndLineEndIdx = value.indexOf('\n', selectionEnd);
      const selEndLineEnd = selEndLineEndIdx === -1 ? value.length : selEndLineEndIdx;
      const fullLines = value.slice(selStartLineStart, selEndLineEnd).split('\n');
      if (fullLines.every(isMarkedLine)) {
        const unmarkedLines = fullLines.map(line => line.slice(marker.length, line.length - marker.length)).join('\n');
        ta.value = value.slice(0, selStartLineStart) + unmarkedLines + value.slice(selEndLineEnd);
        ta.setSelectionRange(selStartLineStart, selStartLineStart + unmarkedLines.length);
        ta.focus();
        return;
      }

      // Case 3: single-line selection is immediately enclosed by markers (e.g. selected "text"
      // inside "some **text** more" where the line itself is not fully marked).
      if (!selected.includes('\n') && selectionStart >= marker.length) {
        const charsBefore = value.slice(selectionStart - marker.length, selectionStart);
        const charsAfter = value.slice(selectionEnd, selectionEnd + marker.length);
        if (charsBefore === marker && charsAfter === marker) {
          ta.value = value.slice(0, selectionStart - marker.length) + selected + value.slice(selectionEnd + marker.length);
          ta.setSelectionRange(selectionStart - marker.length, selectionEnd - marker.length);
          ta.focus();
          return;
        }
      }

      // Case 4: intersection - selection crosses exactly one marker boundary.
      // Case 4A: selection starts inside a marked region and extends past the closing marker.
      //   e.g. `**hel[lo** wor]ld` → `**hello wor**ld`
      // Case 4B: selection starts before a marked region and ends inside it.
      //   e.g. `wor[ld **hel]lo**` → `**world hello**`
      // Only handled for single-line selections to avoid cross-line ambiguity.
      if (!selected.includes('\n')) {
        const markerRe = new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');

        // Case 4A: find opening marker before selection; verify exactly one closing marker
        // sits between that opening and selectionEnd (so the pair is unambiguous).
        const beforeSel = value.slice(selStartLineStart, selectionStart);
        const openPosInBefore = beforeSel.lastIndexOf(marker);
        if (openPosInBefore !== -1) {
          const openAbsPos = selStartLineStart + openPosInBefore;
          const afterOpenToSelEnd = value.slice(openAbsPos + marker.length, selectionEnd);
          const markerMatches = [...afterOpenToSelEnd.matchAll(markerRe)];
          if (markerMatches.length === 1) {
            const closeAbsPos = openAbsPos + marker.length + markerMatches[0].index!;
            if (closeAbsPos >= selectionStart && selectionEnd > closeAbsPos + marker.length) {
              ta.value = value.slice(0, closeAbsPos) + value.slice(closeAbsPos + marker.length, selectionEnd) + marker + value.slice(selectionEnd);
              ta.setSelectionRange(openAbsPos + marker.length, selectionEnd - marker.length);
              ta.focus();
              return;
            }
          }
        }

        // Case 4B: find closing marker after selection; verify exactly one opening marker
        // sits between selectionStart and that closing marker (so the pair is unambiguous).
        const afterSel = value.slice(selectionEnd, selEndLineEnd);
        const closePosInAfter = afterSel.indexOf(marker);
        if (closePosInAfter !== -1) {
          const closeAbsPos = selectionEnd + closePosInAfter;
          const selStartToClose = value.slice(selectionStart, closeAbsPos);
          const markerMatches = [...selStartToClose.matchAll(markerRe)];
          if (markerMatches.length === 1) {
            const openAbsPos = selectionStart + markerMatches[0].index!;
            if (openAbsPos > selectionStart) {
              ta.value = value.slice(0, selectionStart) + marker + value.slice(selectionStart, openAbsPos) + value.slice(openAbsPos + marker.length);
              ta.setSelectionRange(selectionStart + marker.length, closeAbsPos);
              ta.focus();
              return;
            }
          }
        }
      }

      // Default: add markers per line.
      const marked = lines.map(line => marker + line + marker).join('\n');
      ta.value = value.slice(0, selectionStart) + marked + value.slice(selectionEnd);
      ta.setSelectionRange(selectionStart + marker.length, selectionStart + marked.length - marker.length);
    } else {
      // No selection: check if cursor is within a marker pair on this line.
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const lineEndIdx = value.indexOf('\n', selectionStart);
      const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
      const beforeCursor = value.slice(lineStart, selectionStart);
      const afterCursor = value.slice(selectionStart, lineEnd);
      const openIdx = beforeCursor.lastIndexOf(marker);
      const closeIdx = afterCursor.indexOf(marker);

      if (openIdx !== -1 && closeIdx !== -1) {
        const openAbsPos = lineStart + openIdx;
        const closeAbsPos = selectionStart + closeIdx;
        ta.value = value.slice(0, openAbsPos) + value.slice(openAbsPos + marker.length, closeAbsPos) + value.slice(closeAbsPos + marker.length);
        const newPos = selectionStart - marker.length;
        ta.setSelectionRange(newPos, newPos);
      } else {
        ta.value = value.slice(0, selectionStart) + marker + marker + value.slice(selectionStart);
        const newPos = selectionStart + marker.length;
        ta.setSelectionRange(newPos, newPos);
      }
    }
    ta.focus();
  }

  return (
    <section className={`flex flex-col ${props.col ? 'md:flex-col' : 'md:flex-row'} flex-nowrap gap-4 w-full`}>
      {props.editable && isEditing && <div id="markdown" className={`flex-1 max-w-full ${isEditing ?? 'md:max-w-1/2'}`}>
        <div className="flex flex-row flex-wrap gap-1 w-full mb-2">
          <MkButton text="Heading 1" icon="h1" onClick={() => insertMarkdownSymbol('#')} />
          <MkButton text="Heading 2" icon="h2" onClick={() => insertMarkdownSymbol('##')} />
          <MkButton text="Heading 3" icon="h3" onClick={() => insertMarkdownSymbol('###')} />
          <MkButton text="Heading 4" icon="h4" onClick={() => insertMarkdownSymbol('####')} />
          <MkButton text="Heading 5" icon="h5" onClick={() => insertMarkdownSymbol('#####')} />
          <MkButton text="Heading 6" icon="h6" onClick={() => insertMarkdownSymbol('######')} />
          <MkButton text="Text" icon="text" />
          <MkButton text="Bulleted List" icon="format_list_bulleted" onClick={() => insertMarkdownSymbol('-')} />
          <MkButton text="Numbered List" icon="format_list_numbered" onClick={() => insertMarkdownSymbol('1.')} />
          <MkButton text="Quote" icon="format_quote" onClick={() => insertMarkdownSymbol('>')} />

          <MkToolbarSeparator color="var(--color-gamma)" />

          <MkButton text="Bold" icon="format_bold" onClick={() => insertMarkdownMarker(mkMarkers.bold)} />
          <MkButton text="Italic" icon="format_italic" onClick={() => insertMarkdownMarker(mkMarkers.italic)} />
          <MkButton text="Underline" icon="format_underlined" onClick={() => insertMarkdownMarker(mkMarkers.underlined)} />
          <MkButton text="Strikethrough" icon="strikethrough" onClick={() => insertMarkdownMarker(mkMarkers.strikethrough)} />

          <MkToolbarSeparator color="var(--color-gamma)" />

          <MkButton text="Game System Link" icon="dataset_linked" />

          <MkToolbarSeparator color="var(--color-gamma)" />

          <MkButton text="Decrease Indent" icon="format_intent_decrease" />
          <MkButton text="Increase Indent" icon="format_indent_increase" />
        </div>
        <textarea
          ref={textareaRef}
          className="w-full shadow-lg shadow-gamma p-2 rounded-md"
          rows={editRows}
          defaultValue={props.data}
        ></textarea>
        <div className="flex flex-row flex-wrap justify-center w-full gap-2 mt-4">
          <MkButton text="Confirm Changes" icon="check" onClick={confirmChanges} />
          <MkButton text="Preview Changes" icon="preview" onClick={previewChanges} />
          <MkButton text="Revert Changes" icon="undo" onClick={cancelChanges} />
        </div>
      </div>}
      <div className={`flex-1 max-w-full p-2 ${isEditing ?? 'md:max-w-1/2'}`}>
        {props.editable && <div className="flex flex-row w-full justify-end">
          <MkButton text="Edit Section" icon="edit" onClick={() => setIsEditing(e => !e)} />
        </div>}
        <div id="render" ref={renderRef}></div>
      </div>
    </section>
  );
}
