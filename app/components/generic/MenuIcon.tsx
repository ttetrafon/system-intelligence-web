import { Activity } from "react";
import { Svg, type SvgName } from "./Svg";

interface MenuIconProps {
  imageName: SvgName;
  title?: string;
  alwaysShowText?: boolean;
  className?: string;
}

export default function MenuIcon({ imageName, title, alwaysShowText = false, className = '' }: MenuIconProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`} title={title}>
      <Svg className="h-6 w-6" name={imageName} />
      <Activity mode={title && title !== '' ? 'visible' : 'hidden'}>
        <span className={`${alwaysShowText ? 'block' : 'hidden md:block'}`}>{title}</span>
      </Activity>
    </div>
  );
}
