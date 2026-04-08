import { useRef, useState } from 'react';
import { useGameSystem } from '~/context/GameSystemContext';
import { Modal } from './Modal';
import type { DataLink } from '@app-types/game';

interface GameLinkModalInsertProps {
  isOpen: boolean;
  onOk: (link: DataLink, givenLabel?: string) => void;
  onCancel: () => void;
}

export function GameLinkModalInsert({ isOpen, onOk, onCancel }: GameLinkModalInsertProps) {
  const { dataLinks } = useGameSystem();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [display, setDisplay] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const allLinks = dataLinks?.gameSystem ?? [];
  const links = filter.trim() === ''
    ? allLinks
    : allLinks.filter(l =>
      l.label.toLowerCase().includes(filter.toLowerCase()) ||
      l.address.toLowerCase().includes(filter.toLowerCase())
    );

  const selectIndex = (index: number, fromLinks = links) => {
    const link = fromLinks[index];
    if (!link) return;
    setSelectedId(link.id);
    setDisplay(link.label);
    // Scroll the selected button into view
    const button = listRef.current?.children[index] as HTMLElement | undefined;
    button?.scrollIntoView({ block: 'nearest' });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = e.target.value;
    setFilter(newFilter);
    const filtered = newFilter.trim() === ''
      ? allLinks
      : allLinks.filter(l =>
        l.label.toLowerCase().includes(newFilter.toLowerCase()) ||
        l.address.toLowerCase().includes(newFilter.toLowerCase())
      );
    if (selectedId !== null && !filtered.some(l => l.id === selectedId)) {
      selectIndex(0, filtered);
    }
  };

  const handleFilterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const currentIndex = links.findIndex(l => l.id === selectedId);
    if (e.key === 'ArrowDown') {
      selectIndex(currentIndex < links.length - 1 ? currentIndex + 1 : 0);
    } else {
      selectIndex(currentIndex > 0 ? currentIndex - 1 : links.length - 1);
    }
  };

  const reset = () => {
    setFilter('');
    setDisplay('');
    setSelectedId(null);
  };

  const handleOk = () => {
    const link = allLinks.find(l => l.id === selectedId);
    if (!link) return;
    const trimmed = display.trim();
    const givenLabel = trimmed !== '' && trimmed !== link.label ? trimmed : undefined;
    reset();
    onOk(link, givenLabel);
  };
  const handleCancel = () => { reset(); onCancel(); };

  return (
    // TODO: if a link is selected, call handleOk on 'Enter'
    <Modal isOpen={isOpen} onClose={handleCancel}>
      {/* TODO: maybe change this to a form from section? */}
      <section className='flex flex-col flex-nowrap gap-2 max-w-150' onKeyDown={handleFilterKeyDown}>
        <h6>Data Link</h6>
        {/* data */}
        <input autoFocus className='text-center min-w-0' type='text' placeholder="Link's Address" value={filter} onChange={handleFilterChange} />
        <div ref={listRef} className='p-2 max-h-75 rounded border border-typography overflow-y-auto'>
          {links.map((link, index) => (
            <button
              key={link.id}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-background/25 ${selectedId === link.id ? 'bg-background/25 font-semibold' : ''}`}
              onClick={() => selectIndex(index)}
            >
              {link.label} ({link.address})
            </button>
          ))}
        </div>
        <input className='text-center min-w-0' type='text' placeholder='Display' value={display} onChange={(e) => setDisplay(e.target.value)} />
        {/* controls */}
        <div className="flex flex-row flex-nowrap gap-2 justify-center">
          <button className="px-4 py-2 rounded bg-background border border-typography hover:bg-background/25" onClick={handleCancel}>Cancel</button>
          <button className="px-4 py-2 rounded bg-background border border-typography hover:bg-background/25" onClick={handleOk}>Ok</button>
        </div>
      </section>
    </Modal>
  );
}
