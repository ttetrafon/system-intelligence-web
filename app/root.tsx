import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import { useState } from 'react';
import { UserProvider } from './context/UserContext';
import type { Route } from './+types/root';
import './app.css';
import Contents from './components/game-system/Contents';
import Footer from './components/general/Footer';
import Loader from './components/general/Loader';
import { GameSystemProvider } from './context/GameSystemContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { AppProvider } from './context/AppContext';
import { HeadWrapper } from './components/general/HeadWrapper';
import { getJwtPayload } from 'util/lib-react/routes/loaders';
import type { SiJwtPayload } from '@app-types/user';
import { env } from 'cloudflare:workers';
import type { RootLoaderData } from '@app-types/paths';

export const links: Route.LinksFunction = () => [];

export function Layout({ children }: { children: React.ReactNode }) {
  const [isContentsVisible, setIsContentsVisible] = useState(false);
  const toggleContents = () => setIsContentsVisible(!isContentsVisible);

  return (
    <UserProvider>
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <AppProvider>
          <WebSocketProvider>
            <GameSystemProvider>
              <body className="w-full h-dvh antialiased bg-background text-typography flex flex-col flex-nowrap justify-stretch">
                <HeadWrapper toggleContents={toggleContents} />
                <main className="flex-1 flex flex-row flex-nowrap justify-stretch overflow-hidden">
                  <Contents
                    isContentsVisible={isContentsVisible}
                    toggleContents={toggleContents}
                  />
                  <section className="flex flex-col flex-nowrap justify-stretch items-stretch flex-1 p-2 overflow-hidden">{children}</section>
                  {/* <Side /> */}
                </main>
                <Footer />
                <Loader />
                <ScrollRestoration />
                <Scripts />
              </body>
            </GameSystemProvider>
          </WebSocketProvider>
        </AppProvider>
      </html>
    </UserProvider>
  );
}

export async function loader({ request, context }: Route.LoaderArgs): Promise<RootLoaderData<SiJwtPayload>> {
  let jwtPayload = await getJwtPayload<SiJwtPayload>(request, env.SESSION_SECRET);
  return { payload: jwtPayload };
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
