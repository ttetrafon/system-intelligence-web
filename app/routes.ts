import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('login', 'routes/login.tsx'),
  route('dashboard', 'routes/dashboard.tsx'),
  route('api/me', 'routes/api.me.tsx'),
  route('api/logout', 'routes/api.logout.tsx'),
] satisfies RouteConfig;
