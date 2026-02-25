import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'System Intelligence' },
    { name: 'description', content: 'System Intelligence' },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <h1>System Intelligence</h1>
    </>
  );
}
