import type { MkDocument } from "@app-types/game";

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
