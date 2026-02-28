import { svgs } from "util/svgs";

export const svgNames = Object.keys(svgs) as SvgName[];
export type SvgName = keyof typeof svgs;

export interface SvgProps {
  name: SvgName;
  fill?: string;
  className?: string;
}

export function Svg({ name, fill = "black", className }: SvgProps) {
  return <span className={`block size-full [&>svg]:size-full ${className ?? ''}`} style={{ fill }}>{svgs[name]}</span>;
}
