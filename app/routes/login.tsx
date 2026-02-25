import type { Route } from './+types/login';
import Login from '~/components/auth/Login';
import { verifyPassword, createJWT, createJWTCookie } from '../../util/security';

interface DBUser {
  id: number;
  username: string;
  display: string | null;
  colour: string;
  system_role: string;
  password_hash: string | null;
}

export async function action({ request, context }: Route.ActionArgs) {
  const env = context.cloudflare.env as unknown as {
    DB: D1Database;
    SESSION_SECRET: string;
  };

  const formData = await request.formData();
  const email = (formData.get('email') as string | null)?.trim();
  const password = formData.get('password') as string | null;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const user = await env.DB.prepare(
    'SELECT id, username, display, colour, system_role, password_hash FROM USERS WHERE username = ? AND loginType = ?'
  )
    .bind(email, 'email')
    .first<DBUser>();

  if (!user || !user.password_hash) {
    return { error: 'Invalid email or password.' };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return { error: 'Invalid email or password.' };
  }

  const token = await createJWT(
    { sub: user.id, username: user.username, display: user.display, colour: user.colour, system_role: user.system_role },
    env.SESSION_SECRET
  );

  const isSecure = new URL(request.url).protocol === 'https:';
  const cookie = createJWTCookie(token, isSecure);

  return Response.json(
    { user: { id: user.id, username: user.username, display: user.display, colour: user.colour, system_role: user.system_role } },
    { headers: { 'Set-Cookie': cookie } }
  );
}

export default function LoginPage() {
  return <Login />;
}
