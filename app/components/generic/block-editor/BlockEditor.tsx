import type { BlockDocument } from "@app-types/game";
import { useEffect, useRef, useState } from "react";
import { BlockEditorButton } from "./BlockEditorButton";
import { BlockEditorToolbarSeparator } from "./BlockEditorToolbarSeparator";
import { buildHtml, handleKeyDown, handleKeyUp } from "util/blockEditorScripts";
import { buildCommandsFromHistory, useCommandHistory } from "util/commands";

export interface BlockEditorProps {
  editable: boolean,
  dataSystem: string,
  dataPath: string,
  dataProperty: string,
  data: BlockDocument,
  dataKey: string,
}

export function BlockEditor({ ...props }: BlockEditorProps) {
  const [editing, setEditing] = useState<boolean>(false);
  const contentsRef = useRef<HTMLElement>(null);
  const history = useCommandHistory();
  const beforeContentRef = useRef<string>('');

  const buildContents = () => {
    if (!contentsRef.current) return;
    const el = contentsRef.current;
    el.innerHTML = "";
    buildHtml(props.data).then(fragment => {
      el.appendChild(fragment);
    });
  }

  useEffect(() => {
    if (editing) return;
    buildContents();
  }, [props.data, editing]);

  useEffect(() => {
    if (!contentsRef.current) return;
    for (const child of contentsRef.current.children) {
      (child as HTMLElement).contentEditable = editing ? 'true' : 'false';
    }
  }, [editing]);

  return (
    <>
      {/* editor controls */}
      {props.editable && <section className="flex flex-row flex-wrap gap-1 w-full mb-2">
        {!editing && <BlockEditorButton text="Edit Document" icon="edit" onClick={() => setEditing(true)} />}

        {editing && <>
          <BlockEditorButton text="Heading 1" icon="h1" onClick={() => { }} />
          <BlockEditorButton text="Heading 2" icon="h2" onClick={() => { }} />
          <BlockEditorButton text="Heading 3" icon="h3" onClick={() => { }} />
          <BlockEditorButton text="Heading 4" icon="h4" onClick={() => { }} />
          <BlockEditorButton text="Heading 5" icon="h5" onClick={() => { }} />
          <BlockEditorButton text="Heading 6" icon="h6" onClick={() => { }} />
          <BlockEditorButton text="Text" icon="text" />
          <BlockEditorButton text="Bulleted List" icon="format_list_bulleted" onClick={() => { }} />
          <BlockEditorButton text="Numbered List" icon="format_list_numbered" onClick={() => { }} />
          <BlockEditorButton text="Quote" icon="format_quote" onClick={() => { }} />

          <BlockEditorToolbarSeparator color="var(--color-gamma)" />

          <BlockEditorButton text="Bold" icon="format_bold" onClick={() => { }} />
          <BlockEditorButton text="Italic" icon="format_italic" onClick={() => { }} />
          <BlockEditorButton text="Underline" icon="format_underlined" onClick={() => { }} />
          <BlockEditorButton text="Strikethrough" icon="strikethrough" onClick={() => { }} />

          <BlockEditorToolbarSeparator color="var(--color-gamma)" />

          <BlockEditorButton text="Game System Link" icon="dataset_linked" onClick={() => { }} />

          <BlockEditorToolbarSeparator color="var(--color-gamma)" />

          <BlockEditorButton text="Decrease Indent" icon="format_intent_decrease" onClick={() => { }} />
          <BlockEditorButton text="Increase Indent" icon="format_indent_increase" onClick={() => { }} />

          <BlockEditorToolbarSeparator color="var(--color-gamma)" />

          <BlockEditorButton text="Save Changes" icon="save" onClick={async () => {
            const body = buildCommandsFromHistory(
              history.getApplied(),
              props.data,
              { dataPath: props.dataPath, dataProperty: props.dataProperty, dataKey: props.dataKey },
            );
            const response = await fetch(`/api/game-system/${props.dataSystem}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            if (response.ok) setEditing(false);
          }} />
          <BlockEditorButton text="Revert Changes" icon="cancel" onClick={() => setEditing(false)} />
        </>}

      </section>}
      {/* contents */}
      <section
        className="block-editor-contents overflow-auto min-h-0"
        ref={contentsRef}
        onKeyDownCapture={(e) => { if (editing) handleKeyDown(e, history.push); }}
        onKeyUpCapture={handleKeyUp}
        onFocus={(e) => {
          if (e.target === contentsRef.current) return;
          beforeContentRef.current = (e.target as HTMLElement).innerHTML;
        }}
        onBlur={(e) => {
          if (!editing) return;
          const target = e.target as HTMLElement;
          if (target === contentsRef.current) return;
          if (!contentsRef.current?.contains(target)) return;
          const after = target.innerHTML;
          if (after !== beforeContentRef.current) {
            history.push({ type: 'element-changed', id: target.id, before: beforeContentRef.current, after });
          }
        }}
      ></section>
    </>
  );
}
