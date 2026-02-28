interface Connection {
  writer: WritableStreamDefaultWriter<Uint8Array>;
  heartbeat: ReturnType<typeof setInterval>;
}

export class SystemNotifier {
  private connections = new Map<string, Connection>();
  private encoder = new TextEncoder();

  constructor(
    private state: DurableObjectState,
    private env: Env,
  ) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/connect') {
      return this.handleConnect(request);
    }

    if (request.method === 'POST' && url.pathname === '/broadcast') {
      return this.handleBroadcast(request);
    }

    return new Response('Not found', { status: 404 });
  }

  private handleConnect(request: Request): Response {
    const id = crypto.randomUUID();
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();

    // Confirm connection
    writer.write(this.encoder.encode(': connected\n\n')).catch(() => {});

    // Keep-alive ping every 25s (browser/CF timeout is typically 30s+)
    const heartbeat = setInterval(() => {
      writer.write(this.encoder.encode(': ping\n\n')).catch(() => {
        clearInterval(heartbeat);
        this.connections.delete(id);
        writer.close().catch(() => {});
      });
    }, 25_000);

    this.connections.set(id, { writer, heartbeat });

    request.signal.addEventListener('abort', () => {
      clearInterval(heartbeat);
      this.connections.delete(id);
      writer.close().catch(() => {});
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  private async handleBroadcast(request: Request): Promise<Response> {
    const { event, data } = await request.json<{ event: string; data: unknown }>();
    const message = this.encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

    const dead: string[] = [];
    for (const [id, { writer }] of this.connections) {
      try {
        await writer.write(message);
      } catch {
        dead.push(id);
      }
    }

    for (const id of dead) {
      const conn = this.connections.get(id);
      if (conn) {
        clearInterval(conn.heartbeat);
        conn.writer.close().catch(() => {});
        this.connections.delete(id);
      }
    }

    return Response.json({ sent: this.connections.size, pruned: dead.length });
  }
}
