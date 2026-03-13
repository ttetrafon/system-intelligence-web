import { createRequestHandler, type ServerBuild } from 'react-router';
import { getJWTFromCookie, verifyJWT } from '../util/security';
import { getGameSystem, updateGameSystemData } from './GameSystem';
import type { UpdateBody } from '@app-types/requests';

export { SystemNotifier } from './SystemNotifier';

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build') as Promise<ServerBuild>,
  import.meta.env.MODE,
);

async function requireAuth(request: Request, env: Env): Promise<Response | null> {
  const token = getJWTFromCookie(request.headers.get('Cookie'));
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyJWT(token, (env as unknown as { SESSION_SECRET: string }).SESSION_SECRET);
  if (!payload) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  return null;
}

async function handleApiRequest(
  url: URL,
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const path = url.pathname.replace(/^\/api/, '');

  if (path === '/health') {
    return Response.json({ status: 'ok' });
  }

  const gameSystemMatch = path.match(/^\/game-system\/([^/]+)(?:\/(\d+))?$/)
  if (gameSystemMatch && request.method === 'GET') {
    const system = gameSystemMatch[1];
    const timestamp = gameSystemMatch[2] ? parseInt(gameSystemMatch[2], 10) : Date.now();
    return getGameSystem(env.DB, env.ASSETS, env.PUBLIC_ENVIRONMENT, system, timestamp);
  }

  if (gameSystemMatch && request.method === 'POST') {
    const token = getJWTFromCookie(request.headers.get('Cookie'));
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token, (env as unknown as { SESSION_SECRET: string }).SESSION_SECRET);
    if (!payload) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (payload.system_role !== 'admin' && payload.system_role !== 'owner') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const system = gameSystemMatch[1];
    const body = await request.json<UpdateBody>();
    const response = await updateGameSystemData(env.ASSETS, system, body, env.PUBLIC_ENVIRONMENT);

    const doEnv = env as unknown as { SYSTEM_NOTIFIER: DurableObjectNamespace };
    const stub = doEnv.SYSTEM_NOTIFIER.get(doEnv.SYSTEM_NOTIFIER.idFromName('global'));
    ctx.waitUntil(stub.fetch(new Request('https://do/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'game-system-update',
        data: { system, dataKey: body.dataKey, commands: body.data },
      }),
    })));

    return response;
  }

  if (path.startsWith('/assets/') && request.method === 'GET') {
    const key = path.slice('/assets/'.length);
    const object = await env.ASSETS.get(key);
    if (!object) return Response.json({ error: 'Not found' }, { status: 404 });

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  return Response.json({ error: 'Not found' }, { status: 404 });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/system/events' && request.method === 'GET') {
      const authError = await requireAuth(request, env);
      if (authError) return authError;

      const doEnv = env as unknown as { SYSTEM_NOTIFIER: DurableObjectNamespace };
      const stub = doEnv.SYSTEM_NOTIFIER.get(doEnv.SYSTEM_NOTIFIER.idFromName('global'));
      const connectInit = env.PUBLIC_ENVIRONMENT !== 'development' ? { signal: request.signal } : undefined;
      return stub.fetch(new Request('https://do/connect', connectInit));
    }

    if (
      url.pathname === '/api/health' ||
      url.pathname.startsWith('/api/game-system/') ||
      url.pathname.startsWith('/api/assets/')
    ) {
      return handleApiRequest(url, request, env, ctx);
    }

    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;
