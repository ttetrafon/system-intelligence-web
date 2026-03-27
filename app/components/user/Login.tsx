import { useState, useEffect } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import { useUser, type SessionUser } from '~/context/UserContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const fetcher = useFetcher<{ error?: string; user?: SessionUser }>();
  const { setSession } = useUser();
  const navigate = useNavigate();

  const isLoading = fetcher.state !== 'idle';
  const error = fetcher.data?.error;

  useEffect(() => {
    if (fetcher.data?.user) {
      setSession(fetcher.data.user);
      navigate('/');
    }
  }, [fetcher.data, setSession, navigate]);

  const handleLogin = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    fetcher.submit({ email, password }, { method: 'post', action: '/login' });
  };

  return (
    <div className="flex justify-center items-center w-full h-max">
      <div className="mt-25 w-full max-w-lg p-8 space-y-8 rounded-lg shadow-md shadow-action">
        <h2>Login</h2>
        <form className='flex flex-col gap-2' onSubmit={handleLogin}>
          <div className='flex flex-row gap-2'>
            <label htmlFor="email" className='min-w-20 flex-0'>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='min-w-0 flex-1'
            />
          </div>
          <div className='flex flex-row gap-2'>
            <label htmlFor="password" className='min-w-20 flex-0'>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className='min-w-0 flex-1'
            />
          </div>
          <button type="submit" disabled={isLoading} className='mt-2 '>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
}
