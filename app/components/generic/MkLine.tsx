import React, { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { buildReactNode } from "util/EditorScripts";
import { countOccurrencesInString } from "util/lib/text/details";

export interface MkLineProps {
  id: string,
  data: string,
  editing: boolean,
  focused?: boolean,
  onContentsUpdated: (id: string, newContents: string) => void,
}

export function MkLine({ id, data, editing, onContentsUpdated }: MkLineProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputRows, setInputRows] = useState<number>(1);
  const [currentInputContents, setCurrentInputContents] = useState<string>("");
  const deferredCurrentTextContent = useDeferredValue<string>(currentInputContents);
  const [textContent, setTextContent] = useState<string>("");
  const [outputNode, setOutputNode] = React.useState<ReactNode>(null);
  const [_, startTransition] = useTransition();

  useEffect(() => {
    if (!editing || !inputRef.current) return;
    inputRef.current.value = data;
    setTextContent(data);
    setInputRows(countOccurrencesInString(data, "\n", 1));
  }, [data]);

  useEffect(() => {
    console.log(`MkLine.useEffect@[editing, textContent]`)
    // Parse the contents from:
    // - editing: from the textarea input
    // - not editing: from the document data
    const contents = editing && inputRef.current ? textContent : data;
    setOutputNode(buildReactNode(contents));
  }, [editing, textContent]);

  function updateOutput() {
    console.log(`updateOutput():`, inputRef.current);
    const value = inputRef.current?.value || "";
    setCurrentInputContents(value);
  }

  useMemo(() => {
    setOutputNode(buildReactNode(deferredCurrentTextContent));
    updatedContents(deferredCurrentTextContent);
  }, [deferredCurrentTextContent]);

  function updatedContents(contents: string) {
    onContentsUpdated(id, contents);
  }

  return (
    <div className="mk-line" id={id}>
      <span>0</span>
      {/* TODO: switch based on editing! */}
      <textarea
        ref={inputRef} rows={inputRows}
        onChange={updateOutput}
      />
      {outputNode}
    </div>
  );
}
