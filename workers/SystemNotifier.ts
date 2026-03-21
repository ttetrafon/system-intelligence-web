import type { BlockDocument, MoralityPair } from '@app-types/game';
import type {
  addBlockToDocumentCommand,
  moralityPairAdded,
  moralityPairDeleted,
  moralityPairUpdated,
  removeBlockFromDocument as RemoveBlockCmd,
  reorderBlocksInDocument as ReorderBlocksCmd,
  updateBlockInDocument as UpdateBlockCmd,
} from '@app-types/requests';
import type { WsClientMessage, WsServerMessage, WsServerError } from '@app-types/websocket';
import {
  addBlockToDocument,
  removeBlockFromDocument,
  reorderBlocksInDocument,
  updateBlockInDocument,
} from 'util/data';
import { r2Key, invalidateDocumentCache } from './GameSystem';

export class SystemNotifier {
  constructor(
    private state: DurableObjectState,
    private env: Env,
  ) { }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/connect') {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected WebSocket upgrade', { status: 426 });
      }

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      // Attach user info passed from the worker via query param
      const userInfo = url.searchParams.get('user');
      this.state.acceptWebSocket(server);
      if (userInfo) {
        server.serializeAttachment({ user: JSON.parse(userInfo) });
      }

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response('Not found', { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== 'string') return;

    let parsed: WsClientMessage;
    try {
      parsed = JSON.parse(message) as WsClientMessage;
    } catch {
      this.sendError(ws, 'Invalid JSON');
      return;
    }

    if (parsed.type !== 'command') {
      this.sendError(ws, `Unknown message type: ${parsed.type}`);
      return;
    }

    // Apply the command to R2 storage
    try {
      await this.processCommand(parsed);
    } catch (err) {
      console.log('Error processing command:', err);
      this.sendError(ws, 'Failed to process command');
      return;
    }

    // Broadcast to all connected sockets (including sender, so their local state updates)
    const outgoing: WsServerMessage = {
      type: 'game-system-update',
      system: parsed.system,
      dataKey: parsed.dataKey,
      commands: [parsed.command],
    };
    const payload = JSON.stringify(outgoing);
    for (const socket of this.state.getWebSockets()) {
      try {
        socket.send(payload);
      } catch {
        // Socket is dead, Cloudflare will clean it up
      }
    }
  }

  async webSocketClose(): Promise<void> {
    // Cloudflare handles cleanup automatically
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    ws.close();
  }

  private sendError(ws: WebSocket, message: string): void {
    const error: WsServerError = { type: 'error', message };
    try {
      ws.send(JSON.stringify(error));
    } catch {
      // Socket is dead
    }
  }

  private async processCommand(msg: WsClientMessage): Promise<void> {
    const key = r2Key(msg.system, msg.dataKey);
    const cmd = msg.command;
    console.log(`--->  processCommand(key=${key})`, cmd);

    // Handle non-block-document commands
    switch (cmd.commandType) {
      case 'add-morality-pair':
        const objectAMP = await this.env.ASSETS.get(key);
        const pairsAMP: MoralityPair[] = objectAMP ? await objectAMP.json<MoralityPair[]>() : [];
        pairsAMP.push({ id: (cmd as moralityPairAdded).id, first: '', second: '' });
        await this.env.ASSETS.put(key, JSON.stringify(pairsAMP), {
          httpMetadata: { contentType: 'application/json' },
        });
        await invalidateDocumentCache(msg.system, msg.dataKey);
        return;
      case 'delete-morality-pair':
        const c = cmd as moralityPairDeleted;
        const objectDMP = await this.env.ASSETS.get(key);
        let pairsDMP: MoralityPair[] = objectDMP ? await objectDMP.json<MoralityPair[]>() : [];
        const indexDMP = pairsDMP.findIndex(p => p.id === c.id);
        if (indexDMP >= 0) {
          pairsDMP.splice(indexDMP, 1);
          await this.env.ASSETS.put(key, JSON.stringify(pairsDMP), {
            httpMetadata: { contentType: 'application/json' },
          });
          await invalidateDocumentCache(msg.system, msg.dataKey);
        }
        return;
      case 'update-morality-pair':
        const u = cmd as moralityPairUpdated;
        const objectUMP = await this.env.ASSETS.get(key);
        const pairsUMP: MoralityPair[] = objectUMP ? await objectUMP.json<MoralityPair[]>() : [];
        const target = pairsUMP.find(p => p.id === u.id);
        if (target) {
          target[u.field] = u.value;
          await this.env.ASSETS.put(key, JSON.stringify(pairsUMP), {
            httpMetadata: { contentType: 'application/json' },
          });
          await invalidateDocumentCache(msg.system, msg.dataKey);
        }
        return;
    }

    // Handle block-document commands
    const object = await this.env.ASSETS.get(key);
    const doc: BlockDocument = object
      ? await object.json<BlockDocument>()
      : { order: [], blocks: {} };

    switch (cmd.commandType) {
      case 'add-block':
        const c = cmd as addBlockToDocumentCommand;
        addBlockToDocument(doc, c.block, c.position);
        break;
      case 'remove-block':
        removeBlockFromDocument(doc, (cmd as RemoveBlockCmd).blockId);
        break;
      case 'reorder-blocks':
        reorderBlocksInDocument(doc, (cmd as ReorderBlocksCmd).updatedOrder);
        break;
      case 'update-block':
        updateBlockInDocument(doc, (cmd as UpdateBlockCmd).updatedBlock);
        break;
    }

    await this.env.ASSETS.put(key, JSON.stringify(doc), {
      httpMetadata: { contentType: 'application/json' },
    });

    await invalidateDocumentCache(msg.system, msg.dataKey);
  }
}
