import type { Route } from './+types/home';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'System Intelligence - Dashboard' },
    { name: 'description', content: 'System Intelligence: User Dashboard' },
  ];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { session, setSession } = useUser();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setSession(null);
    navigate('/login');
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Welcome to your Dashboard</p>
      <p>You are signed in as: {session.display ?? session.username} as {session.system_role}</p>
      <button className='generic' onClick={handleLogout} >
        Logout
      </button>
    </div>
  );
}
