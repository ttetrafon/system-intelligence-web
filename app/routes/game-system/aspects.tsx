import type { Route } from '../+types/home';
import Aspects from '~/components/game-system/Aspects';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'System Intelligence: Aspects' },
    { name: 'description', content: 'System Intelligence - Aspects' },
  ];
}

export default function checks({ loaderData }: Route.ComponentProps) {
  return (
    <Aspects />
  );
}
