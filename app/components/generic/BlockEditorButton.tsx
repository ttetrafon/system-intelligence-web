import React, { useState, type ReactNode } from 'react';
import { Svg, type SvgName } from "./Svg";

export interface BlockEditorButtonProps {
  text: string;
  icon: SvgName;
  onClick?: () => void;
  children?: ReactNode;
}

export function BlockEditorButton({ text, icon, onClick, children }: BlockEditorButtonProps) {
  const [sub, setSub] = useState<boolean>(false);

  return (
    <div className='block-editor-button relative' onClick={() => { if (children) setSub(!sub); }} >
      <button
        title={text}
        className='p-1 size-8 aspect-square cursor-pointer border border-action rounded-sm'
        onClick={() => {
          onClick?.();
        }}>
        <Svg name={icon} fill='var(--color-typography)' />
      </button>
      {children && sub && <div className='absolute left-1/2 -translate-x-1/2 bg-basis py-1 px-2 rounded-md'>
        {children}
      </div>}
    </div>
  );
}
