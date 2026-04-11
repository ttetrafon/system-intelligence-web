import type { BlockDocument, DataLink, DataLinks, GameSystemData } from "@app-types/game";

function isBlockDocument(value: unknown): value is BlockDocument {
  return typeof value === 'object' && value !== null && 'order' in value && 'blocks' in value;
}

function isOrderedEntity(value: unknown): boolean {
  return typeof value === 'object' && value !== null && 'order' in value && 'items' in value;
}

function isUnorderedEntityDictionary(value: unknown): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const entries = Object.values(value as Record<string, unknown>);
  return entries.length > 0 && entries.every(v => typeof v === 'object' && v !== null && 'id' in v);
}

function getEntityLabel(key: string, item: Record<string, unknown>): string {
  if (key === 'pairs' && 'first' in item && 'second' in item) {
    return `${item.first}-${item.second}`;
  }
  return String(item['name'] ?? item['id'] ?? '');
}

function walkStructure(obj: Record<string, unknown>, pathParts: string[], links: DataLink[]): void {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const currentPath = [...pathParts, key];
    // console.log(`---> walking the structure: ${currentPath.join(".")}::${JSON.stringify(currentPath)}`);

    // Skip specific paths for documents/entities we do not wish to make links for.
    if ([
      'characters.morality.pairs'
    ].includes(currentPath.join("."))) {
      continue;
    }

    if (key === 'document' && isBlockDocument(value)) {
      // Document link
      const parentPath = pathParts.join('.');
      const label = pathParts[pathParts.length - 1] ?? key;
      links.push({
        id: parentPath,
        label,
        type: 'document',
        address: currentPath.join('.')
      });

      // Section links from heading blocks
      const doc = value as BlockDocument;
      for (const blockId of doc.order) {
        const block = doc.blocks[blockId];
        if (block && 'type' in block && typeof block.type === 'string' && block.type.startsWith('h')) {
          const titleText = 'content' in block && Array.isArray(block.content)
            ? block.content.map((node: { text: string }) => node.text).join('')
            : '';
          links.push({
            id: block.id,
            label: titleText,
            type: 'section',
            address: `${currentPath.join('.')}#${block.id}`
          });
        }
      }
    }
    else if (isOrderedEntity(value)) {
      // Ordered entity links (has order[] + items{})
      const ordered = value as { order: string[]; items: Record<string, Record<string, unknown>> };
      for (const entityItem of Object.values(ordered.items)) {
        links.push({
          id: String(entityItem['id']),
          label: getEntityLabel(key, entityItem),
          type: 'entity',
          address: `${currentPath.join('.')}.items#${entityItem['id']}`
        });
      }
    }
    else if (isUnorderedEntityDictionary(value)) {
      // Unordered entity links (plain dictionary of entities)
      const dict = value as Record<string, Record<string, unknown>>;
      for (const entityItem of Object.values(dict)) {
        links.push({
          id: String(entityItem['id']),
          label: getEntityLabel(key, entityItem),
          type: 'entity',
          address: `${currentPath.join('.')}#${entityItem['id']}`
        });
      }
    }
    else if (typeof value === 'object' && value !== null) {
      // Recurse into nested objects
      walkStructure(value as Record<string, unknown>, currentPath, links);
    }
  }
}

export async function buildDataLinks(gameData: GameSystemData): Promise<DataLinks> {
  console.log("---> buildDataLinks()");
  const gameSystemLinks: DataLink[] = [];

  walkStructure(gameData as unknown as Record<string, unknown>, [], gameSystemLinks);

  const dataLinks: DataLinks = {
    gameSystem: gameSystemLinks,
  };

  console.log("<==============>");
  console.log("gameData");
  console.log(gameData);
  console.log("dataLinks");
  console.log(dataLinks);
  console.log("<==============>");
  return dataLinks;
}
