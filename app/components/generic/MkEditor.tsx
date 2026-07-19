import { emptyDocument, type DataLink, type GameSystemData, type MkDocument } from "@app-types/game";
import { useGameSystem } from "~/context/GameSystemContext";
import { EditorToolbarSeparator } from "./EditorToolbarSeparator";
import { useEffect, useRef, useState, useTransition } from "react";
import { EditorButton } from "./EditorButton";
import { isLineInDocument } from "util/EditorScripts";
import { MkLine, type MkLineProps } from "./MkLine";
import { useUser } from "~/context/UserContext";

export interface EditorProps {
  dataKey: string,
}

export function MkEditor({ dataKey }: EditorProps) {
  const { session } = useUser();
  const { editing, dataSystem, data } = useGameSystem();
  const editable = session?.system_role === 'admin' || session?.system_role === 'owner';
  const [_, startTransition] = useTransition();
  const [document, setDocument] = useState<MkDocument>(emptyDocument);
  const [contents, setContents] = useState<MkLineProps[]>([]);
  const contentsRef = useRef<HTMLElement>(null);

  // When the game data changes, update the document state.
  useEffect(() => {
    const keyParts = dataKey.split('.');
    let doc: MkDocument | undefined = keyParts.reduce((obj, part) => obj?.[part], data as any) as MkDocument | undefined;
    // TODO: do not update the document if the change is not relevant!
    // will probably need to know the command that updated the gameData to check relevancy?
    if (doc) {
      setDocument(doc);
    }
  }, [data]);
  console.log(dataKey, "->", document);

  useEffect(() => {
    console.log("... useEffect@[gameData, editing]");
    startTransition(() => {
      let l: MkLineProps[] = [];
      for (let i = 0; i < document.order.length; i++) {
        let id: string = document.order[i];
        l.push({
          id,
          data: document.blocks[id],
          editing: editing,
          // focused: false, // TODO: get focused state from currently-editing-line
          onContentsUpdated: (id: string, newContents: string) => {
            console.log(`onContentsUpdated(${id}, ${newContents})`);
            // TODO... send line update contents command
          }
        });
      }
      console.log("contents:", l);
      setContents(l);
    })
  }, [document, editing]); // TODO: maybe push editing on its own, and just update the elements directly instead of updating the state?

  return (
    <>
      {/* editor controls */}
      {editable && <section className="min-h-4 flex flex-row flex-nowrap lg:flex-wrap md:gap-1 justify-center w-full mb-2 overflow-x-auto">
        {/*
        <EditorButton text="Heading 1" icon="h1" onClick={() => changeBlockType(lastFocusedRef, 'h1', pushAndSend)} />
        <EditorButton text="Heading 2" icon="h2" onClick={() => changeBlockType(lastFocusedRef, 'h2', pushAndSend)} />
        <EditorButton text="Heading 3" icon="h3" onClick={() => changeBlockType(lastFocusedRef, 'h3', pushAndSend)} />
        <EditorButton text="Heading 4" icon="h4" onClick={() => changeBlockType(lastFocusedRef, 'h4', pushAndSend)} />
        <EditorButton text="Heading 5" icon="h5" onClick={() => changeBlockType(lastFocusedRef, 'h5', pushAndSend)} />
        <EditorButton text="Heading 6" icon="h6" onClick={() => changeBlockType(lastFocusedRef, 'h6', pushAndSend)} />
        <EditorButton text="Text" icon="text" onClick={() => changeBlockType(lastFocusedRef, 'p', pushAndSend)} />
        <EditorButton text="Bulleted List" icon="format_list_bulleted" onClick={() => { }} />
        <EditorButton text="Numbered List" icon="format_list_numbered" onClick={() => { }} />
        <EditorButton text="Quote" icon="format_quote" onClick={() => changeBlockType(lastFocusedRef, 'blockquote', pushAndSend)} />
        */}

        <EditorToolbarSeparator color="var(--color-action)" />

        {/*
        <EditorButton text="Bold" icon="format_bold" onClick={() => { }} />
        <EditorButton text="Italic" icon="format_italic" onClick={() => { }} />
        <EditorButton text="Underline" icon="format_underlined" onClick={() => { }} />
        <EditorButton text="Strikethrough" icon="strikethrough" onClick={() => { }} />
        */}

        <EditorToolbarSeparator color="var(--color-action)" />

        {/*
        <EditorButton text="Table" icon="table" onClick={() => insertTable(lastFocusedRef, contentsRef, pushAndSend)} />
        <EditorButton text="Game System Link" icon="dataset_linked" onClick={() => setGameLinkModalOpen(true)} disabled={!isWithinText} />
        <EditorButton text="Special Block" icon="folder_special" >
          <button className="text-nowrap" onClick={() => { insertMoralityPairsBlock(lastFocusedCellRef, contentsRef, pushAndSend); mountReactPlaceholders(props.editable); }}>Morality Pairs</button>
        </EditorButton>
        */}

        <EditorToolbarSeparator color="var(--color-action)" />

        {/*
        <EditorButton text="Decrease Indent" icon="format_intent_decrease" onClick={() => { }} />
        <EditorButton text="Increase Indent" icon="format_indent_increase" onClick={() => { }} />
        */}
      </section>}
      {/* contents */}
      <section className="overflow-auto min-h-0 flex-1"
        ref={contentsRef}
        onFocus={(e) => {
          const target = e.target as HTMLElement;
        }}
        onBlur={(e) => {
          const target = e.target as HTMLElement;
        }}
        onClick={(e) => {
          /**
           * Clicking anywhere in the editor's area should:
           * if on one of the lines, focus on that line's input
           * if outside of the lines, create a new line and focus on it
           */
          const target = e.target as HTMLElement;
          // console.log("Clicked on editor content:", target);

          if (isLineInDocument(document, target.id)) {
            console.log("Clicked on line with ID:", target.id);
            // TODO: focus on the line's input
          }
          else {
            console.log("Clicked outside of document lines");
            // TODO: check if there is an empty last line in the document
            const emptyLastLineExists = false;
            if (emptyLastLineExists) {
              // TODO: focus to that line
            }
            else {
              // TODO: add a new line in the document
              // TODO: focus on the new line's input
            }


          }
        }}
      >
        {contents.map((line) => (
          <MkLine
            key={line.id}
            id={line.id}
            data={line.data}
            editing={editing}
            onContentsUpdated={(id: string, newContents: string) => {
              console.log(`onContentsUpdated(${id}, ${newContents})`)
              // TODO: ... send line update command
            }}
          />
        ))}
      </section>
    </>
  );
}
