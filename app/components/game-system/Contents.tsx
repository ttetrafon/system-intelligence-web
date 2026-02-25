import MenuIcon from "../generic/MenuIcon";

interface ContentsProps {
  isContentsVisible: boolean;
  toggleContents: () => void;
}

export default function Contents({ isContentsVisible, toggleContents }: ContentsProps) {
  return (
    <nav className={`${isContentsVisible ? 'block' : 'hidden'} lg:block fixed inset-0 z-50 bg-gamma p-2 lg:static lg:z-auto flex flex-col flex-nowrap items-stretch`} >
      <h1>Table of Contents</h1>
      <hr />
      <div className="flex-1 overflow-y-auto">
        <h2>Game System</h2>
      </div>
      <hr />
      <div className="flex-1 overflow-y-auto">
        <h2>World</h2>
      </div>
      <hr />
      <div className="flex-1 overflow-y-auto">
        <h2>Campaign</h2>
      </div>
      <hr />
      <button className="lg:hidden" onClick={toggleContents}>
        <MenuIcon imageName="close"></MenuIcon>
      </button>
    </nav>
  );
}
