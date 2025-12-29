import type { Route } from './+types/home';
import { Link } from 'react-router-dom';
import { supabase } from '~/supabase';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else if (data.session) {
        setUser(data.session.user);
      }
      setLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
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
              Welcome, {user.email}!
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


