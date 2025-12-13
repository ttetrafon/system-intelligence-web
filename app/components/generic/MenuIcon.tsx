import { Activity } from "react";

interface MenuIconProps {
  imageName: string;
  title?: string;
}

export default function MenuIcon({ imageName, title }: MenuIconProps) {
  const iconPath = `/icons/${imageName}.svg`;

  return (
    <div className="flex items-center gap-2" title={title}>
      <img src={iconPath} alt={title} className="h-6 w-6" />
      <Activity mode={ title && title !== '' ? 'visible' : 'hidden' }>
        <span className="hidden md:block">{title}</span>
      </Activity>
    </div>
  );
}
