import { useState, useEffect, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { BlockDocument, DataLink, GameSystemData } from '@app-types/game';
import { InlineButton } from '../generic/InlineButton';
import { Modal } from '../generic/Modal';
import { MoralityPairs } from './MoralityPairs';
import { buildHtml } from '../../../util/blockEditorScripts';

export interface InlineDataLinkProps {
  link: DataLink;
  givenLabel?: string;
  editable: boolean;
  gameData: GameSystemData | null;
}

function resolveByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc, key) => {
    if (acc !== null && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

const HEADING_LEVELS: Partial<Record<string, number>> = {
  h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6,
};

function extractSection(doc: BlockDocument, titleId: string): BlockDocument | undefined {
  const titleBlock = doc.blocks[titleId];
  if (!titleBlock || titleBlock.type === 'table') return undefined;

  const titleLevel = HEADING_LEVELS[titleBlock.type];
  if (titleLevel === undefined) return undefined;

  const startIdx = doc.order.indexOf(titleId);
  if (startIdx === -1) return undefined;

  const sectionOrder: string[] = [];
  for (let i = startIdx; i < doc.order.length; i++) {
    const id = doc.order[i];
    const block = doc.blocks[id];
    if (!block) continue;
    // Stop at next heading of same or higher level (lower number)
    if (i > startIdx && block.type !== 'table') {
      const level = HEADING_LEVELS[block.type];
      if (level !== undefined && level <= titleLevel) break;
    }
    sectionOrder.push(id);
  }

  const sectionBlocks: BlockDocument['blocks'] = {};
  for (const id of sectionOrder) {
    sectionBlocks[id] = doc.blocks[id];
  }

  return { order: sectionOrder, blocks: sectionBlocks };
}

function DocumentDetails({ document, gameData }: { document: BlockDocument; gameData: GameSystemData | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactRootsRef = useRef<Root[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    for (const root of reactRootsRef.current) root.unmount();
    reactRootsRef.current = [];
    container.innerHTML = '';

    buildHtml(document).then(fragment => {
      container.appendChild(fragment);

      for (const el of container.querySelectorAll<HTMLElement>('[data-react-component]')) {
        switch (el.dataset.reactComponent) {
          case 'inline-data-link': {
            const rawLink = el.dataset.link;
            if (!rawLink) break;
            const innerLink: DataLink = JSON.parse(rawLink);
            const innerGivenLabel = el.dataset.givenLabel;
            const root = createRoot(el);
            root.render(<InlineDataLink link={innerLink} editable={false} gameData={gameData} {...(innerGivenLabel !== undefined && { givenLabel: innerGivenLabel })} />);
            reactRootsRef.current.push(root);
            break;
          }
          case 'morality-pairs': {
            const root = createRoot(el);
            root.render(<MoralityPairs editing={false} gameData={gameData} />);
            reactRootsRef.current.push(root);
            break;
          }
        }
      }
    });

    return () => {
      const roots = reactRootsRef.current;
      reactRootsRef.current = [];
      // Defer unmount to avoid calling root.unmount() during React's commit phase
      setTimeout(() => { for (const root of roots) root.unmount(); }, 0);
    };
  }, [document, gameData]);

  return <div ref={containerRef} contentEditable="false" suppressContentEditableWarning />;
}

export function InlineDataLink({ link, givenLabel, editable, gameData }: InlineDataLinkProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function renderLinkDetails(link: DataLink) {
    switch (link.type) {
      case 'document': {
        const doc = gameData ? resolveByPath(gameData, link.address) as BlockDocument | undefined : undefined;
        if (!doc) return <p>Document not found: {link.address}</p>;
        return <DocumentDetails document={doc} gameData={gameData} />;
      }
      case 'section': {
        const [docPath, titleId] = link.address.split('#');
        if (!docPath || !titleId) return <p>Invalid section address: {link.address}</p>;
        const doc = gameData ? resolveByPath(gameData, docPath) as BlockDocument | undefined : undefined;
        if (!doc) return <p>Document not found: {docPath}</p>;
        const section = extractSection(doc, titleId);
        if (!section) return <p>Section not found: {titleId}</p>;
        return <DocumentDetails document={section} gameData={gameData} />;
      }
      case 'entity': return <p>Entity: {link.label}</p>;
      default: return null;
    }
  }

  return (
    <>
      <div className='inline-data-link inline-block bg-action rounded-sm px-1 pr-7 relative' contentEditable='false' suppressContentEditableWarning>
        <span contentEditable='false' suppressContentEditableWarning>{givenLabel ?? link.label}</span>
        <div className='flex flex-row flex-nowrap justify-top items-start absolute -top-2 right-0'>
          <InlineButton text='Open Details' icon='open_in_full' size='size-6' bg='bg-action' onClick={() => setIsModalOpen(true)} />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {renderLinkDetails(link)}
      </Modal>
    </>
  );
}
