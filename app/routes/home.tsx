import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "System Intelligence" },
    { name: "description", content: "System Intelligence" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.cloudflare.env.PUBLIC_ENVIRONMENT };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      Home!
    </div>
  );
}
