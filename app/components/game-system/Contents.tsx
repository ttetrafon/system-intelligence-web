import MenuIcon from "../generic/MenuIcon";

interface ContentsProps {
  isContentsVisible: boolean;
  toggleContents: () => void;
}

export default function Contents({ isContentsVisible, toggleContents }: ContentsProps) {
  return (
    <nav className={`${isContentsVisible ? 'block' : 'hidden'} lg:block fixed inset-0 z-50 bg-gamma p-2 lg:static lg:z-auto flex flex-col flex-nowrap items-stretch`} >
      Table of Contents
      <hr />
      <div className="flex-1 overflow-y-auto"></div>
      <hr />
      <button className="lg:hidden" onClick={toggleContents}>
        <MenuIcon imageName="close"></MenuIcon>
      </button>
    </nav>
  );
}
