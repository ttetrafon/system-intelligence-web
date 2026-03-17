import type { BlockDocument } from "@app-types/game";
import { type ComponentType, useCallback, useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { BlockEditorButton } from "./BlockEditorButton";
import { BlockEditorToolbarSeparator } from "./BlockEditorToolbarSeparator";
import { buildHtml, changeBlockType, clearFocusedBlock, insertTable, handleKeyDown, handleKeyUp, insertMoralityPairsBlock } from "util/blockEditorScripts";
import { buildCommandsFromHistory, useCommandHistory } from "util/commands";
import MoralityPairs from "~/components/game-system/MoralityPairs";

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
  const history = useCommandHistory();
  const contentsRef = useRef<HTMLElement>(null);
  const beforeContentRef = useRef<string>('');
  const beforeTypeRef = useRef<string>('');
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const lastFocusedCellRef = useRef<HTMLElement | null>(null);

  const keyModifierAlt = useState<boolean>(false);
  const keyModifierCtrl = useState<boolean>(false);
  const keyModifierShift = useState<boolean>(false);
  const reactRootsRef = useRef<Map<string, Root>>(new Map());

  // Map of data-react-component values to their React components
  const reactComponentMap: Record<string, ComponentType<{ editing: boolean }>> = {
    'morality-pairs': MoralityPairs,
  };

  const renderReactRoots = useCallback((isEditing: boolean) => {
    for (const [id, root] of reactRootsRef.current) {
      const el = document.getElementById(id);
      if (!el) continue;
      const componentName = el.dataset.reactComponent;
      if (!componentName) continue;
      const Component = reactComponentMap[componentName];
      if (!Component) continue;
      root.render(<Component editing={isEditing} />);
    }
  }, []);

  const mountReactPlaceholders = useCallback((isEditing: boolean) => {
    if (!contentsRef.current) return;
    const placeholders = contentsRef.current.querySelectorAll<HTMLElement>('[data-react-component]');
    for (const el of placeholders) {
      const componentName = el.dataset.reactComponent;
      if (!componentName || reactRootsRef.current.has(el.id)) continue;
      const Component = reactComponentMap[componentName];
      if (!Component) continue;
      const root = createRoot(el);
      root.render(<Component editing={isEditing} />);
      reactRootsRef.current.set(el.id, root);
    }
  }, []);

  const unmountReactRoots = useCallback(() => {
    for (const root of reactRootsRef.current.values()) {
      root.unmount();
    }
    reactRootsRef.current.clear();
  }, []);

  const buildContents = () => {
    if (!contentsRef.current) return;
    const el = contentsRef.current;
    unmountReactRoots();
    el.innerHTML = "";
    buildHtml(props.data).then(fragment => {
      el.appendChild(fragment);
      mountReactPlaceholders(editing);
    });
  }

  useEffect(() => {
    if (editing) return;
    buildContents();
  }, [props.data, editing]);

  // Cleanup roots on unmount
  useEffect(() => {
    return () => unmountReactRoots();
  }, []);

  useEffect(() => {
    if (!contentsRef.current) return;
    for (const child of contentsRef.current.children) {
      (child as HTMLElement).contentEditable = editing ? 'true' : 'false';
    }
    renderReactRoots(editing);
  }, [editing]);

  return (
    <>
      {/* editor controls */}
      {props.editable && <section className="flex flex-row flex-wrap gap-1 justify-center w-full mb-2">
        {!editing && <BlockEditorButton text="Edit Document" icon="edit" onClick={() => setEditing(true)} />}

        {editing && <>
          <BlockEditorButton text="Heading 1" icon="h1" onClick={() => changeBlockType(lastFocusedRef, 'h1', history.push)} />
          <BlockEditorButton text="Heading 2" icon="h2" onClick={() => changeBlockType(lastFocusedRef, 'h2', history.push)} />
          <BlockEditorButton text="Heading 3" icon="h3" onClick={() => changeBlockType(lastFocusedRef, 'h3', history.push)} />
          <BlockEditorButton text="Heading 4" icon="h4" onClick={() => changeBlockType(lastFocusedRef, 'h4', history.push)} />
          <BlockEditorButton text="Heading 5" icon="h5" onClick={() => changeBlockType(lastFocusedRef, 'h5', history.push)} />
          <BlockEditorButton text="Heading 6" icon="h6" onClick={() => changeBlockType(lastFocusedRef, 'h6', history.push)} />
          <BlockEditorButton text="Text" icon="text" onClick={() => changeBlockType(lastFocusedRef, 'p', history.push)} />
          <BlockEditorButton text="Bulleted List" icon="format_list_bulleted" onClick={() => { }} />
          <BlockEditorButton text="Numbered List" icon="format_list_numbered" onClick={() => { }} />
          <BlockEditorButton text="Quote" icon="format_quote" onClick={() => changeBlockType(lastFocusedRef, 'blockquote', history.push)} />

          <BlockEditorToolbarSeparator color="var(--color-gamma)" />

          <BlockEditorButton text="Bold" icon="format_bold" onClick={() => { }} />
          <BlockEditorButton text="Italic" icon="format_italic" onClick={() => { }} />
          <BlockEditorButton text="Underline" icon="format_underlined" onClick={() => { }} />
          <BlockEditorButton text="Strikethrough" icon="strikethrough" onClick={() => { }} />

          <BlockEditorToolbarSeparator color="var(--color-gamma)" />

          <BlockEditorButton text="Table" icon="table" onClick={() => insertTable(lastFocusedRef, contentsRef, history.push)} />
          <BlockEditorButton text="Game System Link" icon="dataset_linked" onClick={() => { }} />
          <BlockEditorButton text="Special Block" icon="folder_special" >
            <button className="text-nowrap" onClick={() => { insertMoralityPairsBlock(lastFocusedCellRef, contentsRef, history.push); mountReactPlaceholders(editing); }}>Morality Pairs</button>
          </BlockEditorButton>

          <BlockEditorToolbarSeparator color="var(--color-gamma)" />

          <BlockEditorButton text="Decrease Indent" icon="format_intent_decrease" onClick={() => { }} />
          <BlockEditorButton text="Increase Indent" icon="format_indent_increase" onClick={() => { }} />

          <BlockEditorToolbarSeparator color="var(--color-gamma)" />

          <BlockEditorButton text="Save Changes" icon="save" onClick={async () => {
            clearFocusedBlock(lastFocusedRef, lastFocusedCellRef);
            const body = buildCommandsFromHistory(
              history.getApplied(),
              props.data,
              { dataPath: props.dataPath, dataProperty: props.dataProperty, dataKey: props.dataKey },
            );
            console.log(body);
            // const response = await fetch(`/api/game-system/${props.dataSystem}`, {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(body),
            // });
            // if (response.ok) {
            //   history.clear();
            //   setEditing(false)
            // };
          }} />
          <BlockEditorButton text="Revert Changes" icon="cancel" onClick={() => {
            clearFocusedBlock(lastFocusedRef, lastFocusedCellRef);
            history.clear();
            setEditing(false);
          }} />
        </>}

      </section>}
      {/* contents */}
      <section
        className="block-editor-contents overflow-auto min-h-0"
        ref={contentsRef}
        onKeyDownCapture={(e) => {
          if (editing) handleKeyDown(e, {
            alt: keyModifierAlt,
            ctrl: keyModifierCtrl,
            shift: keyModifierShift,
          }, history.push);
        }}
        onKeyUpCapture={(e) => {
          if (editing) handleKeyUp(e, {
            alt: keyModifierAlt,
            ctrl: keyModifierCtrl,
            shift: keyModifierShift,
          });
        }}
        onFocus={(e) => {
          if (e.target === contentsRef.current) return;
          const target = e.target as HTMLElement;
          // Move up to the direct child of contentsRef (the block element)
          let block = target;
          while (block.parentElement && block.parentElement !== contentsRef.current) {
            block = block.parentElement;
          }
          if (editing && lastFocusedRef.current !== block) {
            lastFocusedRef.current?.classList.remove('be-focused');
            lastFocusedRef.current = block;
            block.classList.add('be-focused');
          }
          // Track focused cell within a table
          if (editing && target.tagName === 'TD' && lastFocusedCellRef.current !== target) {
            lastFocusedCellRef.current?.classList.remove('be-focused');
            lastFocusedCellRef.current = target;
            target.classList.add('be-focused');
          } else if (target.tagName !== 'TD') {
            lastFocusedCellRef.current?.classList.remove('be-focused');
            lastFocusedCellRef.current = null;
          }
          beforeContentRef.current = target.innerHTML;
        }}
        onBlur={(e) => {
          if (!editing) return;
          const target = e.target as HTMLElement;
          if (target === contentsRef.current) return;
          if (!contentsRef.current?.contains(target)) return;
          const after = target.innerHTML;
          if (after !== beforeContentRef.current) {
            history.push({ type: 'element-changed-contents', id: target.id, before: beforeContentRef.current, after });
          }
        }}
      ></section>
    </>
  );
}
