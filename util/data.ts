import type { AddBlockToDocument, AnyDocumentCommand, RemoveBlockFromDocument, ReorderBlocksInDocument, UpdateBlockInDocument } from "@app-types/commands";
import type { MkDocument, MoralityPairs } from "@app-types/game";

export function updateMarkdownDocument(doc: MkDocument, cmd: AnyDocumentCommand) {
  switch (cmd.commandType) {
    case 'add-block': {
      const c = cmd as AddBlockToDocument;
      addBlockToDocument(doc, c.blockId, c.data, c.position);
      break;
    }
    case 'remove-block':
      removeBlockFromDocument(doc, (cmd as RemoveBlockFromDocument).blockId);
      break;
    case 'reorder-blocks':
      reorderBlocksInDocument(doc, (cmd as ReorderBlocksInDocument).updatedOrder);
      break;
    case 'update-block': {
      const c = cmd as UpdateBlockInDocument;
      updateBlockInDocument(doc, c.blockId, c.data);
      break;
    }
  }
}

export function addBlockToDocument(document: MkDocument, blockId: string, block: string, position: number) {
  document.blocks[blockId] = block;
  document.order.splice(position, 0, blockId);
}

export function removeBlockFromDocument(document: MkDocument, blockId: string) {
  delete document.blocks[blockId];
  document.order.splice(document.order.findIndex(id => id === blockId), 1);
}

export function reorderBlocksInDocument(document: MkDocument, order: string[]) {
  document.order = order;
}

export function updateBlockInDocument(document: MkDocument, blockId: string, block: string) {
  document.blocks[blockId] = block;
}

export function updateMoralityPairs(moralityPairs: MoralityPairs, cmd: AnyDocumentCommand) {
  // TODO...

  // if (command.commandType === 'add-morality-pair' && 'id' in command) {
  //   const existing = (node[docKey] as MoralityPair[]) ?? [];
  //   node[docKey] = [...existing, { id: command.id, first: '', second: '' }];
  // }
  // else if (command.commandType === 'delete-morality-pair' && 'id' in command) {
  //   const existing = (node[docKey] as MoralityPair[]) ?? [];
  //   node[docKey] = existing.filter(p => p.id !== command.id);
  // }
  // else if (command.commandType === 'update-morality-pair' && 'id' in command && 'field' in command && 'value' in command) {
  //   const existing = (node[docKey] as MoralityPair[]) ?? [];
  //   node[docKey] = existing.map(p => p.id === command.id ? { ...p, [command.field as 'first' | 'second']: command.value as string } : p);
  // }


  // case 'add-morality-pair':
  //   const objectAMP = await this.env.ASSETS.get(key);
  //   const pairsAMP: MoralityPair[] = objectAMP ? await objectAMP.json<MoralityPair[]>() : [];
  //   pairsAMP.push({ id: (cmd as MoralityPairAdded).id, first: '', second: '' });
  //   await this.env.ASSETS.put(key, JSON.stringify(pairsAMP), {
  //     httpMetadata: { contentType: 'application/json' },
  //   });
  //   await invalidateDocumentCache(msg.system, msg.command.dataKey);
  //   return;
  // case 'delete-morality-pair':
  //   const c = cmd as MoralityPairDeleted;
  //   const objectDMP = await this.env.ASSETS.get(key);
  //   let pairsDMP: MoralityPair[] = objectDMP ? await objectDMP.json<MoralityPair[]>() : [];
  //   const indexDMP = pairsDMP.findIndex(p => p.id === c.id);
  //   if (indexDMP >= 0) {
  //     pairsDMP.splice(indexDMP, 1);
  //     await this.env.ASSETS.put(key, JSON.stringify(pairsDMP), {
  //       httpMetadata: { contentType: 'application/json' },
  //     });
  //     await invalidateDocumentCache(msg.system, msg.command.dataKey);
  //   }
  //   return;
  // case 'update-morality-pair':
  //   const u = cmd as MoralityPairUpdated;
  //   const objectUMP = await this.env.ASSETS.get(key);
  //   const pairsUMP: MoralityPair[] = objectUMP ? await objectUMP.json<MoralityPair[]>() : [];
  //   const target = pairsUMP.find(p => p.id === u.id);
  //   if (target) {
  //     target[u.field] = u.value;
  //     await this.env.ASSETS.put(key, JSON.stringify(pairsUMP), {
  //       httpMetadata: { contentType: 'application/json' },
  //     });
  //     await invalidateDocumentCache(msg.system, msg.command.dataKey);
  //   }
  //   return;
}
