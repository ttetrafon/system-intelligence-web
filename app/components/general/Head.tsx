import { useState } from "react";
import MenuIcon from "../generic/MenuIcon";
import { Modal } from "../generic/Modal";
import { LoginForm } from "./LoginForm";

interface HeadProps {
  toggleContents: () => void;
}

export default function Head({ toggleContents }: HeadProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

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
      <button
        type="button"
        className="text-text hover:text-white"
        onClick={openLoginModal}
        aria-label="Login"
      >
        <MenuIcon title="Login" imageName="login" />
      </button>
      <button
        type="button"
        className="text-text hover:text-white"
        onClick={() => {}}
        aria-label="Logout"
      >
        <MenuIcon title="Logout" imageName="logout" />
      </button>
      <Modal isOpen={isLoginModalOpen} onClose={closeLoginModal}>
        <LoginForm />
      </Modal>
    </header>
  );
}
