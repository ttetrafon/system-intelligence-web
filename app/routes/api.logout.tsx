import { clearJWTCookie } from 'util/lib/security/passwords-sessions';
import type { Route } from './+types/api.logout';
import { redirect } from 'react-router';

export async function action(_: Route.ActionArgs) {
  return redirect('/', {
    headers: { 'Set-Cookie': clearJWTCookie() },
  });
}
