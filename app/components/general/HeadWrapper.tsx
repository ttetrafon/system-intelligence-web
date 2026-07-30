import { useNavigate } from "react-router";
import { useLoading } from "~/context/AppContext";
import { useUser } from "~/context/UserContext";
import Head from "./Head";

export function HeadWrapper({
  toggleContents,
}: {
  toggleContents: () => void;
}) {
  const { setSession } = useUser();
  const { setLoading } = useLoading();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    await fetch('/api/logout', { method: 'POST' });
    setSession(null);
    navigate('/');
    setLoading(false);
  };

  return <Head toggleContents={toggleContents} onLogout={handleLogout} />;
}
