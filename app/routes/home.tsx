import type { Route } from './+types/home';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'System Intelligence' },
    { name: 'description', content: 'System Intelligence' },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.cloudflare.env.PUBLIC_ENVIRONMENT };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [user, setUser] = useState<null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {

      setLoading(false);
    };
    getSession();


    return () => {

    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>System Intelligence</h1>
      <p>{loaderData.message}</p>
      <div>
        {user ? (
          <div>
            <p>
              Welcome, ???!
            </p>
            <Link to="/dashboard">
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <Link to="/login">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
