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
    <header className="w-full bg-beta p-2 flex justify-center-safe items-stretch gap-4">
      <button
        type="button"
        className="lg:hidden p-1 text-text hover:text-white"
        onClick={toggleContents}
        aria-label="Toggle table of contents"
      >
        <MenuIcon title="Table of Contents" imageName="menu" />
      </button>
      <span className="flex-1"></span>
      {session ? (
        <>
          <span className="text-text self-center">{session.display ?? session.username}</span>
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
