export interface BlockEditorToolbarSeparatorProps {
  color?: string;
}

export function BlockEditorToolbarSeparator({ color = "black" }: BlockEditorToolbarSeparatorProps) {
  return <div className="mx-3 w-px self-stretch" style={{ backgroundColor: color }} />;
}
