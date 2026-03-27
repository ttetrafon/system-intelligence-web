import { useRef, useState } from 'react';
import { useGameSystem } from '~/context/GameSystemContext';

interface DataLinkProps {
  id: string;
  label: string;
};

export function GameLinkModalInsert({ id, label }: DataLinkProps) {
  const { dataLinks } = useGameSystem();

  return (
    <></>
  );
}
