import type { BlockDocument } from '@app-types/game';
import type {
  addBlockToDocumentCommand,
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
  ) {}

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

    // Broadcast to all OTHER connected sockets
    const outgoing: WsServerMessage = {
      type: 'game-system-update',
      system: parsed.system,
      dataKey: parsed.dataKey,
      commands: [parsed.command],
    };
    const payload = JSON.stringify(outgoing);
    for (const socket of this.state.getWebSockets()) {
      if (socket !== ws) {
        try {
          socket.send(payload);
        } catch {
          // Socket is dead, Cloudflare will clean it up
        }
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
    const object = await this.env.ASSETS.get(key);
    const doc: BlockDocument = object
      ? await object.json<BlockDocument>()
      : { order: [], blocks: {} };

    const cmd = msg.command;

    if ('block' in cmd) {
      const c = cmd as addBlockToDocumentCommand;
      addBlockToDocument(doc, c.block, c.position);
    } else if ('blockId' in cmd) {
      removeBlockFromDocument(doc, (cmd as RemoveBlockCmd).blockId);
    } else if ('updatedOrder' in cmd) {
      reorderBlocksInDocument(doc, (cmd as ReorderBlocksCmd).updatedOrder);
    } else if ('updatedBlock' in cmd) {
      updateBlockInDocument(doc, (cmd as UpdateBlockCmd).updatedBlock);
    }

    await this.env.ASSETS.put(key, JSON.stringify(doc), {
      httpMetadata: { contentType: 'application/json' },
    });

    await invalidateDocumentCache(msg.system, msg.dataKey);
  }
}
