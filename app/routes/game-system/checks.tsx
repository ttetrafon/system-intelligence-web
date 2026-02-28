import type { Route } from '../+types/home';
import Checks from '~/components/game-system/Checks';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'System Intelligence: Checks' },
    { name: 'description', content: 'System Intelligence - Checks' },
  ];
}

export default function checks({ loaderData }: Route.ComponentProps) {
  return (
    <Checks />
  );
}
