import Morality from '~/components/game-system/Morality';
import type { Route } from '../+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'System Intelligence: Morality' },
    { name: 'description', content: 'System Intelligence - Morality' },
  ];
}

export default function checks({ loaderData }: Route.ComponentProps) {
  return (
    <Morality />
  );
}
