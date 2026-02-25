import type { Route } from './+types/api.me';
import { getJWTFromCookie, verifyJWT } from '../../util/security';

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.cloudflare.env as unknown as { SESSION_SECRET: string };

  const token = getJWTFromCookie(request.headers.get('Cookie'));
  if (!token) {
    return Response.json({ user: null }, { status: 401 });
  }

  const payload = await verifyJWT(token, env.SESSION_SECRET);
  if (!payload) {
    return Response.json({ user: null }, { status: 401 });
  }

  return Response.json({
    user: {
      id: payload.sub,
      username: payload.username,
      display: payload.display,
      colour: payload.colour,
      system_role: payload.system_role,
    },
  });
}
