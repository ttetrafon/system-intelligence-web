import React, { type ReactNode } from "react";
import ReactDOMServer from "react-dom/server";
import type { MkDocument } from "@app-types/game";
import { buildHtml, buildReactNode } from "util/EditorScripts";

export interface MkLineProps {
  id: string,
  doc: MkDocument,
  editing: boolean,
}

export function MkLine({ id, doc, editing }: MkLineProps) {
  const [outputNode, setOutputNode] = React.useState<ReactNode>(null);
  console.log("MkLine: editing:", editing);

  React.useEffect(() => {
    // Parse the contents from:
    // - editing: from the textarea contents
    // - not editing: from the document.blocks[props.id]

    // TODO: get the line's contents
    const contents = "";
    if (editing) {

    }
    else {

    }

    // TODO: build the appropriate html
    setOutputNode(buildReactNode(contents));
  }, [editing, doc]);

  return (
    <div className="flex flex-row flex-nowrap items-start" id={id}>
      <span>0</span>
      {/* TODO: switch based on editing! */}
      <textarea className="flex-1" />
      {outputNode}
    </div>
  );
}
