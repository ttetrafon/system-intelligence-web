import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import { useState } from 'react';

import { UserProvider, useUser } from './context/UserContext';

import type { Route } from './+types/root';
import './app.css';
import Head from './components/general/Head';
import Contents from './components/game-system/Contents';
import Footer from './components/general/Footer';
import Side from './components/game-system/Side';

export const links: Route.LinksFunction = () => [];

function HeadWrapper({
  toggleContents,
}: {
  toggleContents: () => void;
}) {
  const { session } = useUser();
  return <Head toggleContents={toggleContents} session={session} />;
}

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
        <body className="w-full h-dvh antialiased bg-alpha text-text flex flex-col flex-nowrap justify-stretch">
          <HeadWrapper toggleContents={toggleContents} />
          <main className="flex-1 flex flex-row flex-nowrap justify-stretch">
            <Contents
              isContentsVisible={isContentsVisible}
              toggleContents={toggleContents}
            />
            <article className="flex-1 p-2 overflow-auto">{children}</article>
            <Side />
          </main>
          <Footer />
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    </UserProvider>
  );
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
