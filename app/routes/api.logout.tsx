import type { Route } from './+types/api.logout';
import { redirect } from 'react-router';
import { clearJWTCookie } from '../../util/security';

export async function action(_: Route.ActionArgs) {
  return redirect('/', {
    headers: { 'Set-Cookie': clearJWTCookie() },
  });
}
