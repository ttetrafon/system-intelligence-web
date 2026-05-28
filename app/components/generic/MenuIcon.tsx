import { Activity } from "react";
import { Svg } from "util/lib-react/components/Svg";
import type { SvgName } from "util/lib/icons/googleIconSvgs";

interface MenuIconProps {
  imageName: SvgName;
  title?: string;
  alwaysShowText?: boolean;
  className?: string;
}

export default function MenuIcon({ imageName, title, alwaysShowText = false, className = '' }: MenuIconProps) {
  return (
    <div className={`flex items-center gap-2 hover:shadow-md hover:shadow-action ${className}`} title={title}>
      <Svg className="h-6 w-6" name={imageName} fill='var(--color-typography)' />
      <Activity mode={title && title !== '' ? 'visible' : 'hidden'}>
        <span className={`${alwaysShowText ? 'block' : 'hidden md:block'}`}>{title}</span>
      </Activity>
    </div>
  );
}
