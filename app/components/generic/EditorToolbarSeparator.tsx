export interface EditorToolbarSeparatorProps {
  color?: string;
}

export function EditorToolbarSeparator({ color = "black" }: EditorToolbarSeparatorProps) {
  return <div className="mx-3 w-px self-stretch" style={{ backgroundColor: color }} />;
}
