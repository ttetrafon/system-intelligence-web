import React, { useState, type ReactNode } from 'react';
import { Svg, type SvgName } from "../generic/Svg";
import type { DataLink } from '@app-types/game';

export interface InlineDataLinkProps {
  link: DataLink;
  givenLabel?: string;
}

export function InlineDataLink({ link, givenLabel }: InlineDataLinkProps) {

  return (
    <div className='inline-data-link inline-block bg-action rounded-sm px-1'>{givenLabel ?? link.label}</div>
  );
}
