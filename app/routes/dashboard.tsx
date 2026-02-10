import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<null>(null);

  useEffect(() => {
    const fetchUser = async () => {

    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {

    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Welcome to your Dashboard</h2>
      <p>You are signed in as: ???</p>
      <button
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}
