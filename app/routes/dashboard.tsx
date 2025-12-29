import { supabase } from '~/supabase';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        console.error('Error fetching user:', error);
        navigate('/login');
      } else {
        setUser(data.user);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      navigate('/login');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Welcome to your Dashboard</h2>
      <p>You are signed in as: {user.email}</p>
      <button
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}
