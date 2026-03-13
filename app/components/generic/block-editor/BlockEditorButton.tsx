import { Svg, type SvgName } from "../Svg";

export interface BlockEditorButtonProps {
  text: string;
  icon: SvgName;
  onClick?: () => void;
}

export function BlockEditorButton({ text, icon, onClick }: BlockEditorButtonProps) {
  return (
    <button title={text} className="p-1 size-8 aspect-square cursor-pointer border border-gamma rounded-sm" onClick={onClick}>
      <Svg name={icon} fill="var(--color-delta)" />
    </button>
  );
}
