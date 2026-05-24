import type { GameSystemData, MkDocument } from "@app-types/game";
import { useGameSystem } from "~/context/GameSystemContext";
import { EditorToolbarSeparator } from "./EditorToolbarSeparator";
import { useRef } from "react";

export interface EditorProps {
  editable: boolean,
  dataSystem: string,
  dataKey: string,
  gameData: GameSystemData | null,
}

export function MkEditor({ ...props }: EditorProps) {
  const { data } = useGameSystem();
  // TODO: get the appropriate document from 'gameData[dataKey]'
  // const document =

  const contentsRef = useRef<HTMLElement>(null);

  return (
    <>
      {/* <GameLinkModalInsert
        isOpen={gameLinkModalOpen}
        onOk={(link, givenLabel) => { setGameLinkModalOpen(false); insertDataLinkAtCaret(link, givenLabel); }}
        onCancel={() => setGameLinkModalOpen(false)}
      /> */}
      {/* editor controls */}
      {props.editable && <section className="flex flex-row flex-nowrap lg:flex-wrap md:gap-1 justify-center w-full mb-2 overflow-x-auto">
        {/* <EditorButton text="Heading 1" icon="h1" onClick={() => changeBlockType(lastFocusedRef, 'h1', pushAndSend)} />
        <EditorButton text="Heading 2" icon="h2" onClick={() => changeBlockType(lastFocusedRef, 'h2', pushAndSend)} />
        <EditorButton text="Heading 3" icon="h3" onClick={() => changeBlockType(lastFocusedRef, 'h3', pushAndSend)} />
        <EditorButton text="Heading 4" icon="h4" onClick={() => changeBlockType(lastFocusedRef, 'h4', pushAndSend)} />
        <EditorButton text="Heading 5" icon="h5" onClick={() => changeBlockType(lastFocusedRef, 'h5', pushAndSend)} />
        <EditorButton text="Heading 6" icon="h6" onClick={() => changeBlockType(lastFocusedRef, 'h6', pushAndSend)} />
        <EditorButton text="Text" icon="text" onClick={() => changeBlockType(lastFocusedRef, 'p', pushAndSend)} />
        <EditorButton text="Bulleted List" icon="format_list_bulleted" onClick={() => { }} />
        <EditorButton text="Numbered List" icon="format_list_numbered" onClick={() => { }} />
        <EditorButton text="Quote" icon="format_quote" onClick={() => changeBlockType(lastFocusedRef, 'blockquote', pushAndSend)} /> */}

        <EditorToolbarSeparator color="var(--color-action)" />

        {/* <EditorButton text="Bold" icon="format_bold" onClick={() => { }} />
        <EditorButton text="Italic" icon="format_italic" onClick={() => { }} />
        <EditorButton text="Underline" icon="format_underlined" onClick={() => { }} />
        <EditorButton text="Strikethrough" icon="strikethrough" onClick={() => { }} /> */}

        <EditorToolbarSeparator color="var(--color-action)" />

        {/* <EditorButton text="Table" icon="table" onClick={() => insertTable(lastFocusedRef, contentsRef, pushAndSend)} />
        <EditorButton text="Game System Link" icon="dataset_linked" onClick={() => setGameLinkModalOpen(true)} disabled={!isWithinText} />
        <EditorButton text="Special Block" icon="folder_special" >
          <button className="text-nowrap" onClick={() => { insertMoralityPairsBlock(lastFocusedCellRef, contentsRef, pushAndSend); mountReactPlaceholders(props.editable); }}>Morality Pairs</button>
        </EditorButton> */}

        <EditorToolbarSeparator color="var(--color-action)" />

        {/* <EditorButton text="Decrease Indent" icon="format_intent_decrease" onClick={() => { }} />
        <EditorButton text="Increase Indent" icon="format_indent_increase" onClick={() => { }} /> */}
      </section>}
      {/* contents */}
      <div className="overflow-auto min-h-0">
        <section
          ref={contentsRef}
          onClick={(e) => {
            const target = e.target as HTMLElement;
          }}
          onFocus={(e) => {
            const target = e.target as HTMLElement;
          }}
          onBlur={(e) => {
            const target = e.target as HTMLElement;
          }}
        />
      </div>
    </>
  );
}
