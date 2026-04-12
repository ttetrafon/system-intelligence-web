import type { BlockDocument, DataLink, GameSystemData } from "@app-types/game";
import type { EditorCommand } from "@app-types/editor";
import { type ComponentType, useCallback, useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { BlockEditorButton } from "./BlockEditorButton";
import { BlockEditorToolbarSeparator } from "./BlockEditorToolbarSeparator";
import { GameLinkModalInsert } from "./GameLinkModalInsert";
import { buildHtml, changeBlockType, insertTable, handleKeyDown, handleKeyUp, insertMoralityPairsBlock, wrapBlock, getBlockFromWrapper, renumberGutters } from "util/blockEditorScripts";
import { buildSingleCommand, useCommandHistory } from "util/commands";
import { InlineDataLink } from "~/components/game-system/InlineDataLink";
import { MoralityPairs } from "~/components/game-system/MoralityPairs";
import { useGameSystem } from "~/context/GameSystemContext";
import { useWebSocket } from "~/context/WebSocketContext";
import { useLoading } from "~/context/AppContext";

export interface BlockEditorProps {
  editable: boolean,
  dataSystem: string,
  // TODO: remove 'data' and get the appropriate document from 'gameData[dataKey]'
  dataKey: string,
  data: BlockDocument,
  gameData: GameSystemData | null,
}

export function BlockEditor({ ...props }: BlockEditorProps) {
  const history = useCommandHistory();
  const { sendCommand, subscribe } = useWebSocket();
  const { applyCommand } = useGameSystem();
  const { addPendingCommand, removePendingCommand } = useLoading();

  const sendTrackedCommand = useCallback((msg: Parameters<typeof sendCommand>[0]) => {
    const commandId = crypto.randomUUID();
    addPendingCommand(commandId);
    sendCommand({ ...msg, commandId });
  }, [sendCommand, addPendingCommand]);

  // Clear loader when the server acks a command sent by this editor
  useEffect(() => {
    return subscribe((msg) => {
      if (msg.type === 'command-ack') {
        removePendingCommand(msg.commandId);
      }
    });
  }, [subscribe, removePendingCommand]);

  const commandContext = { dataKey: props.dataKey };

  // Wraps history.push: for structural commands (not content changes), also send immediately via WebSocket
  const pushAndSend = useCallback((cmd: EditorCommand) => {
    history.push(cmd);
    if (cmd.type === 'element-changed-contents') return;
    const docCommand = buildSingleCommand(cmd, props.data, commandContext);
    console.log(`pushAndSend: type=${cmd.type}, id=${'id' in cmd ? cmd.id : '?'}, docCommand=`, docCommand);
    if (docCommand) {
      // Apply optimistically to local state; server will not echo back to sender
      applyCommand(props.dataKey, docCommand);
      skipNextRebuildRef.current = true;
      sendTrackedCommand({
        type: 'command',
        system: props.dataSystem,
        dataKey: props.dataKey,
        command: docCommand,
      });
    }
  }, [sendTrackedCommand, applyCommand, props.data, props.dataSystem, props.dataKey]);
  const contentsRef = useRef<HTMLElement>(null);
  const beforeContentRef = useRef<string>('');
  const beforeTypeRef = useRef<string>('');
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const lastFocusedCellRef = useRef<HTMLElement | null>(null);
  const skipNextRebuildRef = useRef<boolean>(false);
  const savedSelectionRef = useRef<Range | null>(null);
  const [isWithinText, setIsWithinText] = useState<boolean>(false);

  const [gameLinkModalOpen, setGameLinkModalOpen] = useState(false);

  const keyModifierAlt = useState<boolean>(false);
  const keyModifierCtrl = useState<boolean>(false);
  const keyModifierShift = useState<boolean>(false);
  const reactRootsRef = useRef<Map<string, Root>>(new Map());
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const insertDataLinkAtCaret = useCallback((link: DataLink, givenLabel?: string) => {
    const range = savedSelectionRef.current;
    if (!range) return;

    // Remove any selected content (handles replace-selection case)
    range.deleteContents();

    // Build the placeholder span
    const span = document.createElement('span');
    span.id = crypto.randomUUID();
    span.dataset.reactComponent = 'inline-data-link';
    span.dataset.link = JSON.stringify(link);
    if (givenLabel !== undefined) span.dataset.givenLabel = givenLabel;
    span.contentEditable = 'false';

    range.insertNode(span);

    // Mount a React root immediately (bypasses the next mountReactPlaceholders pass)
    const root = createRoot(span);
    root.render(<InlineDataLink link={link} editable={props.editable} gameData={props.gameData} {...(givenLabel !== undefined && { givenLabel })} />);
    reactRootsRef.current.set(span.id, root);

    // Re-focus the contenteditable block (lost when the modal opened) before restoring the selection,
    // otherwise the browser has no anchor and may place the caret inside the non-editable span.
    const editableParent = span.closest<HTMLElement>('[contenteditable="true"]');
    editableParent?.focus();

    // Move caret to just after the inserted span
    const sel = window.getSelection();
    if (sel) {
      const afterRange = document.createRange();
      afterRange.setStartAfter(span);
      afterRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(afterRange);
      savedSelectionRef.current = afterRange.cloneRange();
    }
  }, []);

  const handleAddMoralityPair = useCallback(() => {
    sendTrackedCommand({
      type: 'command',
      system: props.dataSystem,
      dataKey: 'characters.morality.pairs',
      command: {
        commandType: 'add-morality-pair',
        dataKey: 'characters.morality.pairs',
        id: crypto.randomUUID(),
      },
    });
  }, [sendTrackedCommand, props.dataSystem]);

  const handleDeleteMoralityPair = useCallback((id: string) => {
    sendTrackedCommand({
      type: 'command',
      system: props.dataSystem,
      dataKey: 'characters.morality.pairs',
      command: {
        commandType: 'delete-morality-pair',
        dataKey: 'characters.morality.pairs',
        id,
      },
    });
  }, [sendTrackedCommand, props.dataSystem]);

  const handleUpdateMoralityPair = useCallback((id: string, field: 'first' | 'second', value: string) => {
    sendTrackedCommand({
      type: 'command',
      system: props.dataSystem,
      dataKey: 'characters.morality.pairs',
      command: {
        commandType: 'update-morality-pair',
        dataKey: 'characters.morality.pairs',
        id,
        field,
        value,
      },
    });
  }, [sendTrackedCommand, props.dataSystem]);

  // Map of data-react-component values to their React components
  const reactComponentMap: Record<string, ComponentType<{
    editing: boolean,
    gameData: GameSystemData | null,
    onAddPair?: () => void,
    onDeletePair?: (id: string) => void,
    onUpdatePair?: (id: string, field: 'first' | 'second', value: string) => void
  }>> = {
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
      root.render(<Component editing={isEditing} gameData={props.gameData} onAddPair={handleAddMoralityPair} onDeletePair={handleDeleteMoralityPair} onUpdatePair={handleUpdateMoralityPair} />);
    }
  }, [props.gameData]);

  const mountReactPlaceholders = useCallback((isEditing: boolean) => {
    if (!contentsRef.current) return;
    const placeholders = contentsRef.current.querySelectorAll<HTMLElement>('[data-react-component]');
    for (const el of placeholders) {
      const componentName = el.dataset.reactComponent;
      if (!componentName || reactRootsRef.current.has(el.id)) continue;

      if (componentName === 'inline-data-link') {
        const rawLink = el.dataset.link;
        if (!rawLink) continue;
        const link: DataLink = JSON.parse(rawLink);
        const givenLabel = el.dataset.givenLabel;
        const root = createRoot(el);
        root.render(
          <InlineDataLink
            link={link}
            editable={props.editable}
            gameData={props.gameData}
            {...(givenLabel !== undefined && { givenLabel })} />
        );
        reactRootsRef.current.set(el.id, root);
        continue;
      }

      const Component = reactComponentMap[componentName];
      if (!Component) continue;
      const root = createRoot(el);
      root.render(<Component editing={isEditing} gameData={props.gameData} onAddPair={handleAddMoralityPair} onDeletePair={handleDeleteMoralityPair} onUpdatePair={handleUpdateMoralityPair} />);
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
      const blocks = Array.from(fragment.children) as HTMLElement[];
      blocks.forEach((block, i) => {
        el.appendChild(wrapBlock(block, i + 1));
      });
      for (const wrapper of el.children) {
        const block = getBlockFromWrapper(wrapper as HTMLElement);
        if (block) {
          block.contentEditable = (!block.dataset.reactComponent && props.editable) ? 'true' : 'false';
        }
      }
      mountReactPlaceholders(props.editable);
    });
  }

  useEffect(() => {
    if (skipNextRebuildRef.current) {
      skipNextRebuildRef.current = false;
      return;
    }
    buildContents();
  }, [props.data]);

  // Cleanup roots on unmount
  useEffect(() => {
    return () => unmountReactRoots(true);
  }, []);

  useEffect(() => {
    if (!contentsRef.current) return;
    for (const wrapper of contentsRef.current.children) {
      const block = getBlockFromWrapper(wrapper as HTMLElement);
      if (block) {
        block.contentEditable = (!block.dataset.reactComponent && props.editable) ? 'true' : 'false';
      }
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

  // Track caret position and whether it's within an editable element
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = document.getSelection();
      if (!sel || sel.rangeCount === 0) {
        setIsWithinText(false);
        return;
      }
      const activeEl = document.activeElement as HTMLElement | null;
      const withinEditable = !!activeEl?.isContentEditable && !!contentsRef.current?.contains(activeEl);
      if (withinEditable) {
        savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
        setIsWithinText(true);
      } else {
        setIsWithinText(false);
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // Renumber gutters when wrappers are added/removed
  useEffect(() => {
    if (!contentsRef.current) return;
    const observer = new MutationObserver(() => {
      requestAnimationFrame(() => {
        if (contentsRef.current) renumberGutters(contentsRef.current);
      });
    });
    observer.observe(contentsRef.current, { childList: true });
    return () => observer.disconnect();
  }, [props.data]);

  return (
    <>
      <GameLinkModalInsert
        isOpen={gameLinkModalOpen}
        onOk={(link, givenLabel) => { setGameLinkModalOpen(false); insertDataLinkAtCaret(link, givenLabel); }}
        onCancel={() => setGameLinkModalOpen(false)}
      />
      {/* editor controls */}
      {props.editable && <section className="flex flex-row flex-nowrap lg:flex-wrap md:gap-1 justify-center w-full mb-2 overflow-x-auto">
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

        <BlockEditorToolbarSeparator color="var(--color-action)" />

        <BlockEditorButton text="Bold" icon="format_bold" onClick={() => { }} />
        <BlockEditorButton text="Italic" icon="format_italic" onClick={() => { }} />
        <BlockEditorButton text="Underline" icon="format_underlined" onClick={() => { }} />
        <BlockEditorButton text="Strikethrough" icon="strikethrough" onClick={() => { }} />

        <BlockEditorToolbarSeparator color="var(--color-action)" />

        <BlockEditorButton text="Table" icon="table" onClick={() => insertTable(lastFocusedRef, contentsRef, pushAndSend)} />
        <BlockEditorButton text="Game System Link" icon="dataset_linked" onClick={() => setGameLinkModalOpen(true)} disabled={!isWithinText} />
        <BlockEditorButton text="Special Block" icon="folder_special" >
          <button className="text-nowrap" onClick={() => { insertMoralityPairsBlock(lastFocusedCellRef, contentsRef, pushAndSend); mountReactPlaceholders(props.editable); }}>Morality Pairs</button>
        </BlockEditorButton>

        <BlockEditorToolbarSeparator color="var(--color-action)" />

        <BlockEditorButton text="Decrease Indent" icon="format_intent_decrease" onClick={() => { }} />
        <BlockEditorButton text="Increase Indent" icon="format_indent_increase" onClick={() => { }} />
      </section>}
      {/* contents */}
      <div className="overflow-auto min-h-0">
        <section
          className={`block-editor-contents${props.editable ? ' editing' : ''}`}
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
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('block-gutter') && target.dataset.tooltip) {
              // Close any other open tooltip
              contentsRef.current?.querySelectorAll('.block-gutter.tooltip-visible').forEach(el => {
                if (el !== target) el.classList.remove('tooltip-visible');
              });
              const isNowVisible = target.classList.toggle('tooltip-visible');
              if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
              if (isNowVisible) {
                tooltipTimerRef.current = setTimeout(() => {
                  target.classList.remove('tooltip-visible');
                  tooltipTimerRef.current = null;
                }, 5000);
              }
            } else {
              // Click outside a gutter closes all tooltips
              if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
              contentsRef.current?.querySelectorAll('.block-gutter.tooltip-visible').forEach(el => {
                el.classList.remove('tooltip-visible');
              });
            }
          }}
          onFocus={(e) => {
            if (e.target === contentsRef.current) return;
            const target = e.target as HTMLElement;
            // Walk up to the wrapper (direct child of contentsRef), then get the actual block
            let wrapper = target;
            while (wrapper.parentElement && wrapper.parentElement !== contentsRef.current) {
              wrapper = wrapper.parentElement;
            }
            const block = getBlockFromWrapper(wrapper) ?? wrapper;
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
                applyCommand(props.dataKey, docCommand);
                skipNextRebuildRef.current = true;
                sendTrackedCommand({
                  type: 'command',
                  system: props.dataSystem,
                  dataKey: props.dataKey,
                  command: docCommand,
                });
              }
            }
          }}
        ></section>
      </div>
    </>
  );
}
