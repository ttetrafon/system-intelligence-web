import { Svg, type SvgName } from "../Svg";

export interface MkButtonProps {
  text: string;
  icon: SvgName;
}

export function MkButton({ text, icon }: MkButtonProps) {
  return (
    <button title={text} className="p-1 size-8 cursor-pointer shadow-md rounded-sm">
      <Svg name={icon} />
    </button>
  );
}
