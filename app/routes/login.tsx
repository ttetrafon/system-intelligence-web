import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Auth } from '@supabase/auth-ui-react';
import { useEffect } from 'react';

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate('/');
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Also check for active session on initial load
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    checkSession();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <Auth
          supabaseClient={supabase}
          providers={['google', 'github']}
        />
      </div>
    </div>
  );
}
