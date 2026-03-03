import { useEffect, useRef } from "react";
import { MkButton } from "./MkButton";
import { MkToolbarSeparator } from "./MkToolbarSeparator";
import { convertMkToHtml } from "util/MkScripts";
import { useGameSystem } from "~/context/GameSystemContext";

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

  const { data: contextData } = useGameSystem();
  const renderData = props.dataKey.split('.').reduce<unknown>(
    (obj, key) => (obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[key] : undefined),
    contextData
  ) as string | undefined;

  useEffect(() => {
    if (renderRef.current)
      convertMkToHtml(renderData ?? '', renderRef.current);
  }, [renderData]);

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
      }),
    });
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
  }

  return (
    <section className={`flex flex-col ${props.col ? 'md:flex-col' : 'md:flex-row'} flex-nowrap gap-4 w-full`}>
      {props.editable && <div id="markdown" className="flex-1 max-w-full md:max-w-1/2">
        <div className="flex flex-row flex-wrap gap-1 w-full mb-2">
          <MkButton text="Heading 1" icon="h1" />
          <MkButton text="Heading 2" icon="h2" />
          <MkButton text="Heading 3" icon="h3" />
          <MkButton text="Heading 4" icon="h4" />
          <MkButton text="Heading 5" icon="h5" />
          <MkButton text="Heading 6" icon="h6" />
          <MkButton text="Text" icon="text" />
          <MkButton text="Bulleted List" icon="format_list_bulleted" />
          <MkButton text="Numbered List" icon="format_list_numbered" />
          <MkButton text="Quote" icon="format_quote" />

          <MkToolbarSeparator color="var(--color-gamma)" />

          <MkButton text="Bold" icon="format_bold" />
          <MkButton text="Italic" icon="format_italic" />
          <MkButton text="Underline" icon="format_underlined" />

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
      <div className="flex-1 max-w-full md:max-w-1/2 p-2">
        {props.editable && <div className="flex flex-row w-full">
          {/* TODO: controls for when this is editable! */}
        </div>}
        <div id="render" ref={renderRef}></div>
      </div>
    </section>
  );
}
