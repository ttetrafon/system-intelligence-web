import { createRequestHandler, type ServerBuild } from 'react-router';
import { getJWTFromCookie, verifyJWT } from '../util/security';
import { getGameSystem } from './GameSystem';

export { SystemNotifier } from './SystemNotifier';

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build') as Promise<ServerBuild>,
  import.meta.env.MODE,
);

async function handleApiRequest(
  url: URL,
  request: Request,
  env: Env,
): Promise<Response> {
  const path = url.pathname.replace(/^\/api/, '');

  if (path === '/health') {
    return Response.json({ status: 'ok' });
  }

  const gameSystemMatch = path.match(/^\/game-system\/([^/]+)$/)
  if (gameSystemMatch && request.method === 'GET') {
    return getGameSystem(env.DB, env.ASSETS, env.PUBLIC_ENVIRONMENT);
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

    if (url.pathname === '/api/system/ws' && request.headers.get('Upgrade') === 'websocket') {
      const token = getJWTFromCookie(request.headers.get('Cookie'));
      if (!token) return new Response('Unauthorized', { status: 401 });

      const payload = await verifyJWT(token, (env as unknown as { SESSION_SECRET: string }).SESSION_SECRET);
      if (!payload) return new Response('Unauthorized', { status: 401 });

      if (payload.system_role !== 'admin' && payload.system_role !== 'owner') {
        return new Response('Forbidden', { status: 403 });
      }

      const doEnv = env as unknown as { SYSTEM_NOTIFIER: DurableObjectNamespace };
      const stub = doEnv.SYSTEM_NOTIFIER.get(doEnv.SYSTEM_NOTIFIER.idFromName('global'));

      // Forward the WebSocket upgrade to the Durable Object, passing user info
      const doUrl = new URL('https://do/connect');
      doUrl.searchParams.set('user', JSON.stringify({
        sub: payload.sub,
        system_role: payload.system_role,
      }));

      return stub.fetch(new Request(doUrl.toString(), {
        headers: request.headers,
      }));
    }

    if (
      url.pathname === '/api/health' ||
      url.pathname.startsWith('/api/game-system/') ||
      url.pathname.startsWith('/api/assets/')
    ) {
      return handleApiRequest(url, request, env);
    }

    return requestHandler(request);
  },
} satisfies ExportedHandler<Env>;
