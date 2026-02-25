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
    <header className="w-full bg-beta p-2 flex justify-center-safe items-center gap-4">
      <button
        type="button"
        className="lg:hidden p-1 text-text hover:text-white"
        onClick={toggleContents}
        aria-label="Toggle table of contents"
      >
        <MenuIcon title="Table of Contents" imageName="menu" />
      </button>
      <Link to='/' className="text-text hover:text-white">
        <MenuIcon title='Home' imageName={'home'}></MenuIcon>
      </Link>
      <span className="flex-1"></span>
      {session ? (
        <>
          <Link to="/dashboard" className="text-text self-center hover:text-white">{session.display ?? session.username}</Link>
          <button
            type="button"
            className="text-text hover:text-white"
            onClick={onLogout}
            aria-label="Logout"
          >
            <MenuIcon title="Logout" imageName="logout" />
          </button>
        </>
      ) : (
        <Link to="/login" className="text-text hover:text-white" aria-label="Login">
          <MenuIcon title="Login" imageName="login" />
        </Link>
      )}
    </header>
  );
}
