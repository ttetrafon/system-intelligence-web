import React, { useState, type ReactNode } from 'react';
import { Svg, type SvgName } from "./Svg";

export interface InlineButtonProps {
  text: string;
  icon: SvgName;
  onClick?: () => void;
  disabled?: boolean;
  size?: string;
  bg?: string;
}

export function InlineButton({ text, icon, onClick, disabled, size = 'size-8', bg = 'bg-background' }: InlineButtonProps) {
  return (
    <div
      className={`block-editor-button relative m-0 rounded-sm ${bg} border border-typography`}
      contentEditable='false'
      suppressContentEditableWarning>
      <button
        title={text}
        disabled={disabled}
        contentEditable="false"
        suppressContentEditableWarning
        className={`${size} aspect-square cursor-pointer border border-action rounded-sm m-0`}
        onClick={() => {
          onClick?.();
        }}>
        <Svg name={icon} fill='var(--color-typography)' />
      </button>
    </div>
  );
}
