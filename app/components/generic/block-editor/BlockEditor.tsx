import type { BlockDocument, GameSystemData } from "@app-types/game";
import type { EditorCommand } from "@app-types/editor";
import { type ComponentType, useCallback, useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { BlockEditorButton } from "./BlockEditorButton";
import { BlockEditorToolbarSeparator } from "./BlockEditorToolbarSeparator";
import { buildHtml, changeBlockType, insertTable, handleKeyDown, handleKeyUp, insertMoralityPairsBlock } from "util/blockEditorScripts";
import { buildSingleCommand, useCommandHistory } from "util/commands";
import MoralityPairs from "~/components/game-system/MoralityPairs";
import { useWebSocket } from "~/context/WebSocketContext";

export interface BlockEditorProps {
  editable: boolean,
  dataSystem: string,
  dataKey: string,
  data: BlockDocument,
  gameData: GameSystemData | null,
}

export function BlockEditor({ ...props }: BlockEditorProps) {
  const history = useCommandHistory();
  const { sendCommand } = useWebSocket();

  const commandContext = { dataKey: props.dataKey };

  // Wraps history.push: for structural commands (not content changes), also send immediately via WebSocket
  const pushAndSend = useCallback((cmd: EditorCommand) => {
    history.push(cmd);
    if (cmd.type === 'element-changed-contents') return;
    const docCommand = buildSingleCommand(cmd, props.data, commandContext);
    if (docCommand) {
      sendCommand({
        type: 'command',
        system: props.dataSystem,
        dataKey: props.dataKey,
        command: docCommand,
      });
    }
  }, [sendCommand, props.data, props.dataSystem, props.dataKey]);
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
  const reactComponentMap: Record<string, ComponentType<{ editing: boolean, gameData: GameSystemData | null }>> = {
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
      root.render(<Component editing={isEditing} gameData={props.gameData} />);
    }
  }, [props.gameData]);

  const mountReactPlaceholders = useCallback((isEditing: boolean) => {
    if (!contentsRef.current) return;
    const placeholders = contentsRef.current.querySelectorAll<HTMLElement>('[data-react-component]');
    for (const el of placeholders) {
      const componentName = el.dataset.reactComponent;
      if (!componentName || reactRootsRef.current.has(el.id)) continue;
      const Component = reactComponentMap[componentName];
      if (!Component) continue;
      const root = createRoot(el);
      root.render(<Component editing={isEditing} gameData={props.gameData} />);
      reactRootsRef.current.set(el.id, root);
    }
  }, [props.gameData]);

  const unmountReactRoots = useCallback((deferred = false) => {
    const roots = Array.from(reactRootsRef.current.values());
    reactRootsRef.current.clear();
    if (deferred) {
      // Defer unmount to avoid calling root.unmount() during React's commit phase
      setTimeout(() => { for (const root of roots) root.unmount(); }, 0);
    } else {
      for (const root of roots) root.unmount();
    }
  }, []);

  const buildContents = () => {
    if (!contentsRef.current) return;
    const el = contentsRef.current;
    unmountReactRoots(true);
    el.innerHTML = "";
    buildHtml(props.data).then(fragment => {
      el.appendChild(fragment);
      mountReactPlaceholders(props.editable);
    });
  }

  useEffect(() => {
    buildContents();
  }, [props.data]);

  // Cleanup roots on unmount
  useEffect(() => {
    return () => unmountReactRoots();
  }, []);

  useEffect(() => {
    if (!contentsRef.current) return;
    for (const child of contentsRef.current.children) {
      (child as HTMLElement).contentEditable = props.editable ? 'true' : 'false';
    }
    if (reactRootsRef.current.size > 0) {
      renderReactRoots(props.editable);
    }
  }, [props.editable]);

  // Re-render isolated roots when game data changes
  useEffect(() => {
    if (reactRootsRef.current.size > 0) {
      renderReactRoots(props.editable);
    }
  }, [props.gameData]);

  return (
    <>
      {/* editor controls */}
      {props.editable && <section className="flex flex-row flex-wrap gap-1 justify-center w-full mb-2">
        <BlockEditorButton text="Heading 1" icon="h1" onClick={() => changeBlockType(lastFocusedRef, 'h1', pushAndSend)} />
        <BlockEditorButton text="Heading 2" icon="h2" onClick={() => changeBlockType(lastFocusedRef, 'h2', pushAndSend)} />
        <BlockEditorButton text="Heading 3" icon="h3" onClick={() => changeBlockType(lastFocusedRef, 'h3', pushAndSend)} />
        <BlockEditorButton text="Heading 4" icon="h4" onClick={() => changeBlockType(lastFocusedRef, 'h4', pushAndSend)} />
        <BlockEditorButton text="Heading 5" icon="h5" onClick={() => changeBlockType(lastFocusedRef, 'h5', pushAndSend)} />
        <BlockEditorButton text="Heading 6" icon="h6" onClick={() => changeBlockType(lastFocusedRef, 'h6', pushAndSend)} />
        <BlockEditorButton text="Text" icon="text" onClick={() => changeBlockType(lastFocusedRef, 'p', pushAndSend)} />
        <BlockEditorButton text="Bulleted List" icon="format_list_bulleted" onClick={() => { }} />
        <BlockEditorButton text="Numbered List" icon="format_list_numbered" onClick={() => { }} />
        <BlockEditorButton text="Quote" icon="format_quote" onClick={() => changeBlockType(lastFocusedRef, 'blockquote', pushAndSend)} />

        <BlockEditorToolbarSeparator color="var(--color-gamma)" />

        <BlockEditorButton text="Bold" icon="format_bold" onClick={() => { }} />
        <BlockEditorButton text="Italic" icon="format_italic" onClick={() => { }} />
        <BlockEditorButton text="Underline" icon="format_underlined" onClick={() => { }} />
        <BlockEditorButton text="Strikethrough" icon="strikethrough" onClick={() => { }} />

        <BlockEditorToolbarSeparator color="var(--color-gamma)" />

        <BlockEditorButton text="Table" icon="table" onClick={() => insertTable(lastFocusedRef, contentsRef, pushAndSend)} />
        <BlockEditorButton text="Game System Link" icon="dataset_linked" onClick={() => { }} />
        <BlockEditorButton text="Special Block" icon="folder_special" >
          <button className="text-nowrap" onClick={() => { insertMoralityPairsBlock(lastFocusedCellRef, contentsRef, pushAndSend); mountReactPlaceholders(props.editable); }}>Morality Pairs</button>
        </BlockEditorButton>

        <BlockEditorToolbarSeparator color="var(--color-gamma)" />

        <BlockEditorButton text="Decrease Indent" icon="format_intent_decrease" onClick={() => { }} />
        <BlockEditorButton text="Increase Indent" icon="format_indent_increase" onClick={() => { }} />
      </section>}
      {/* contents */}
      <section
        className="block-editor-contents overflow-auto min-h-0"
        ref={contentsRef}
        onKeyDownCapture={(e) => {
          if (props.editable) handleKeyDown(e, {
            alt: keyModifierAlt,
            ctrl: keyModifierCtrl,
            shift: keyModifierShift,
          }, pushAndSend);
        }}
        onKeyUpCapture={(e) => {
          if (props.editable) handleKeyUp(e, {
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
          if (props.editable && lastFocusedRef.current !== block) {
            lastFocusedRef.current?.classList.remove('be-focused');
            lastFocusedRef.current = block;
            block.classList.add('be-focused');
          }
          // Track focused cell within a table
          if (props.editable && target.tagName === 'TD' && lastFocusedCellRef.current !== target) {
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
          if (!props.editable) return;
          const target = e.target as HTMLElement;
          if (target === contentsRef.current) return;
          if (!contentsRef.current?.contains(target)) return;
          const after = target.innerHTML;
          if (after !== beforeContentRef.current) {
            const cmd: EditorCommand = { type: 'element-changed-contents', id: target.id, before: beforeContentRef.current, after };
            history.push(cmd);
            // Send content update on blur via WebSocket
            const docCommand = buildSingleCommand(cmd, props.data, commandContext);
            if (docCommand) {
              sendCommand({
                type: 'command',
                system: props.dataSystem,
                dataKey: props.dataKey,
                command: docCommand,
              });
            }
          }
        }}
      ></section>
    </>
  );
}
