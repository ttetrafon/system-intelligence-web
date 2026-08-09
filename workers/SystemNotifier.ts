import type { WsClientMessage, WsServerMessage, WsServerAck, WsServerError } from '@app-types/websocket';
import { invalidateDocumentCache, r2Key } from './GameSystem';
import type { MkDocument } from '@app-types/game';
import { updateMarkdownDocument } from 'util/data';

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

    // Process the msg depending on its type
    switch (parsed.type) {
      case 'command':
        if (!parsed.command) {
          this.sendError(ws, `Message of type '${parsed.type}' missing the command.`);
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

        // Acknowledge back to sender so the client can clear its loading state
        if (parsed.command.commandId) {
          const ack: WsServerAck = { type: 'command-ack', commandId: parsed.command.commandId };
          try {
            ws.send(JSON.stringify(ack));
          } catch {
            // Socket is dead
          }
        }

        // Broadcast to all connected sockets except the sender (sender applies optimistically)
        const outgoing: WsServerMessage = {
          type: 'game-system-update',
          system: parsed.system,
          commands: [parsed.command],
        };
        const payload = JSON.stringify(outgoing);
        for (const socket of this.state.getWebSockets()) {
          if (socket === ws) continue;
          try {
            socket.send(payload);
          } catch {
            // Socket is dead, Cloudflare will clean it up
          }
        }
        break;
      case 'chat':
        // TODO: handle chat...
        break;
      default:
        this.sendError(ws, `Unknown message type: ${parsed.type}`);
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
    if (!msg.command) return;

    const key = r2Key(msg.system, msg.command.dataKey);
    const cmd = msg.command;
    console.log(`--->  processCommand(key=${key})`, cmd);

    if (cmd.commandType === 'add-block' || cmd.commandType === 'remove-block' || cmd.commandType === 'reorder-blocks' || cmd.commandType === 'update-block') {
      const docObject = await this.env.ASSETS.get(key);
      const doc: MkDocument = docObject
        ? await docObject.json<MkDocument>()
        : { order: [], blocks: {} };

      updateMarkdownDocument(doc, cmd);

      await this.env.ASSETS.put(key, JSON.stringify(doc), {
        httpMetadata: { contentType: 'application/json' },
      });

      await invalidateDocumentCache(msg.system, msg.command.dataKey);
    }
    else if (cmd.commandType === 'add-morality-pair' || cmd.commandType === 'delete-morality-pair' || cmd.commandType === 'update-morality-pair') {
      // TODO...
    }
    else {
      console.warn(`Received unknown command: ${JSON.stringify(cmd)}`);
    }
  }
}
