import type { Route } from './+types/login';
import Login from '~/components/user/Login';
import { env } from 'cloudflare:workers';
import { createJWT, createJWTCookie, verifyPassword } from 'util/lib/security/passwords-sessions';
import type { DBUser, SiJwtPayload, SystemRole } from '@app-types/user';

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "System Intelligence: User Login" },
    { name: "description", content: "System Intelligence: User login page" },
  ];
}

export async function action({ request, context }: Route.ActionArgs) {
  const SESSION_SECRET: string = env.SESSION_SECRET;
  const DB: D1Database = env.DB;

  const formData = await request.formData();
  const email = (formData.get('email') as string | null)?.trim();
  const password = formData.get('password') as string | null;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const user = await DB.prepare(
    'SELECT * FROM USERS WHERE username = ? AND loginType = ?'
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

  const token = await createJWT<SiJwtPayload>(
    {
      sub: user.id,
      username: user.username,
      colour: user.colour,
      system_role: user.system_role as SystemRole,
      loginType: user.login_type,
      email: user.email
    },
    SESSION_SECRET
  );

  const isSecure = new URL(request.url).protocol === 'https:';
  const cookie = createJWTCookie(token, isSecure);

  return Response.json(
    { user: { id: user.id, username: user.username, colour: user.colour, system_role: user.system_role } },
    { headers: { 'Set-Cookie': cookie } }
  );
}

export default function LoginPage() {
  return <Login />;
}
