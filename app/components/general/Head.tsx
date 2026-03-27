import { Link } from 'react-router-dom';
import MenuIcon from '../generic/MenuIcon';
import type { SessionUser } from '~/context/UserContext';

interface HeadProps {
  toggleContents: () => void;
  session: SessionUser | null;
  onLogout: () => void;
}

export default function Head({ toggleContents, session, onLogout }: HeadProps) {
  return (
    <header className="w-full bg-base p-2 flex justify-center-safe items-center gap-4 border-b border-background">
      <button
        type="button"
        className="lg:hidden p-1 text-typography hover:shadow shadow-action"
        onClick={toggleContents}
        aria-label="Toggle table of contents"
      >
        <MenuIcon title="Table of Contents" imageName="menu" />
      </button>
      <Link to='/' className="text-typography rounded hover:shadow shadow-action">
        <MenuIcon title='Home' imageName={'home'}></MenuIcon>
      </Link>
      <span className="flex-1"></span>
      {session ? (
        <>
          <Link to="/dashboard" className="text-typography self-center rounded hover:shadow shadow-action">{session.display ?? session.username}</Link>
          <button
            type="button"
            className="text-typography rounded hover:shadow shadow-action"
            onClick={onLogout}
            aria-label="Logout"
          >
            <MenuIcon title="Logout" imageName="logout" />
          </button>
        </>
      ) : (
        <Link to="/login" className="text-typography rounded hover:shadow shadow-action" aria-label="Login">
          <MenuIcon title="Login" imageName="login" />
        </Link>
      )}
    </header>
  );
}
