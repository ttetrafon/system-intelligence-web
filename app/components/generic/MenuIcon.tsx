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
    <div className={`w-full h-6 flex flex-row gap-2 items-center justify-start hover:shadow-md hover:shadow-action ${className}`} title={title}>
      {/* FIXME: Svg expanding on flex... */}
      <Svg className="grow-0 shrink-0" name={imageName} fill='var(--color-typography)' />
      <Activity mode={title && title !== '' ? 'visible' : 'hidden'}>
        <span className={`flex-1 w-full ${alwaysShowText ? 'block' : 'hidden md:block'}`}>{title}</span>
      </Activity>
    </div>
  );
}
