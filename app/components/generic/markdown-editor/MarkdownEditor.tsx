import { useRef } from "react";
import { MkButton } from "./MkButton";
import { MkToolbarSeparator } from "./MkToolbarSeparator";
import { convertMkToHtml } from "util/MkScripts";

export interface MarkdownEditorProps {
  editable: boolean,
  editRows?: number,
}

export function MarkdownEditor({ editRows = 10, ...props }: MarkdownEditorProps) {
  const renderRef = useRef<HTMLDivElement>(null);
  return (
    <section className="flex flex-row flex-nowrap gap-4 w-full">
      {props.editable && <div id="markdown" className="flex-1 max-w-1/2">
        <div className="flex flex-row gap-1 w-full">
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

          <MkToolbarSeparator />

          <MkButton text="Bold" icon="format_bold" />
          <MkButton text="Italic" icon="format_italic" />
          <MkButton text="Underline" icon="format_underlined" />

          <MkToolbarSeparator />

          <MkButton text="Decrease Indent" icon="format_intent_decrease" />
          <MkButton text="Increase Indent" icon="format_indent_increase" />
        </div>
        <textarea
          className="w-full shadow-md p-2 rounded-md"
          rows={editRows}
          onBlur={(e) => { if (renderRef.current) convertMkToHtml(e.target.value, renderRef.current); }}
        >
          Markdown!!!
        </textarea>
        <div className="flex flex-row w-full">
          {/* TODO: general editor controls, like emitting events to the app and controlling local state */}
        </div>
      </div>}
      <div className="flex-1 max-w-1/2 p-2">
        {props.editable && <div className="flex flex-row w-full">
          {/* TODO: controls for when this is editable! */}
        </div>}
        <div id="render" ref={renderRef}>Render!!!</div>
      </div>
    </section>
  );
}
