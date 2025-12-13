import MenuIcon from "../generic/MenuIcon";

interface HeadProps {
  toggleContents: () => void;
}

export default function Head({ toggleContents }: HeadProps) {
  return (
    <header className="w-full bg-beta p-2 flex justify-between items-center">
      <button
        type="button"
        className="lg:hidden p-1 text-text hover:text-white"
        onClick={toggleContents}
        aria-label="Toggle table of contents"
      >
        <MenuIcon title="Table of Contents" imageName="menu" />
      </button>
    </header>
  );
}
