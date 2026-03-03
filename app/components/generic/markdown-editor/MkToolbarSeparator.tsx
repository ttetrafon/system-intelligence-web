export interface MkToolbarSeparatorProps {
  color?: string;
}

export function MkToolbarSeparator({ color = "black" }: MkToolbarSeparatorProps) {
  return <div className="mx-3 w-px self-stretch" style={{ backgroundColor: color }} />;
}
