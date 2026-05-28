import React, { useState, type ReactNode } from 'react';
import { Svg } from 'util/lib-react/components/Svg';
import type { SvgName } from 'util/lib/icons/googleIconSvgs';

export interface EditorButtonProps {
  text: string;
  icon: SvgName;
  onClick?: () => void;
  children?: ReactNode;
  disabled?: boolean;
  size?: string;
}

export function EditorButton({ text, icon, onClick, children, disabled, size = 'size-8' }: EditorButtonProps) {
  const [sub, setSub] = useState<boolean>(false);

  return (
    <div className='editor-button relative' onClick={() => { if (children) setSub(!sub); }} >
      <button
        title={text}
        disabled={disabled}
        className={`p-1 ${size} aspect-square cursor-pointer border border-action rounded-sm`}
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
