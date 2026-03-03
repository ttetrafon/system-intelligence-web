import { type RouteConfig, index, prefix, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('login', 'routes/login.tsx'),
  route('dashboard', 'routes/dashboard.tsx'),
  ...prefix('api', [
    route('me', 'routes/api.me.tsx'),
    route('logout', 'routes/api.logout.tsx'),
  ]),
  ...prefix('game-system', [
    route('aspects', 'routes/game-system/aspects.tsx'),
    route('checks', 'routes/game-system/checks.tsx'),
    route('morality', 'routes/game-system/morality.tsx'),
  ])
] satisfies RouteConfig;
