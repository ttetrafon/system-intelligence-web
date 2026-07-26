import { getJWTFromCookie, verifyJWT } from 'util/lib/security/passwords-sessions';
import type { Route } from './+types/api.me';
import { env } from 'cloudflare:workers';
import type { SiJwtPayload } from '@app-types/user';

export async function loader({ request, context }: Route.LoaderArgs) {
  const sessionSecret = env.SESSION_SECRET;

  const token = getJWTFromCookie(request.headers.get('Cookie'));
  if (!token) {
    return Response.json({ user: null }, { status: 401 });
  }

  const payload = await verifyJWT<SiJwtPayload>(token, sessionSecret);
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
