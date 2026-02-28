import { createRequestHandler, type ServerBuild } from 'react-router';

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

  // if (path === '/categories' && request.method === 'PUT') {
  //   const authError = await requireAuth(request, env);
  //   if (authError) return authError;

  //   return updateCategories(env.DB, request);
  // }

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
    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;
