import type { Block, BlockDocument } from "@app-types/game";

export function addBlockToDocument(document: BlockDocument, block: Block, position: number) {
  document.blocks[block.id] = block;
  document.order.splice(position, 0, block.id);
}

export function removeBlockFromDocument(document: BlockDocument, blockId: string) {
  delete document.blocks[blockId];
  document.order.splice(document.order.findIndex(id => id === blockId), 1);
}

export function reorderBlocksInDocument(document: BlockDocument, order: string[]) {
  document.order = order;
}

export function updateBlockInDocument(document: BlockDocument, block: Block) {
  document.blocks[block.id] = block;
}
