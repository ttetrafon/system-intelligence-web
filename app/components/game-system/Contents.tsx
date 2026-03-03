import { Link } from "react-router-dom";
import MenuIcon from "../generic/MenuIcon";

interface ContentsProps {
  isContentsVisible: boolean;
  toggleContents: () => void;
}

export default function Contents({ isContentsVisible, toggleContents }: ContentsProps) {
  return (
    <nav className={`${isContentsVisible ? 'block' : 'hidden'} lg:block fixed inset-0 z-99 bg-gamma p-2 lg:static lg:z-auto flex flex-col flex-nowrap items-stretch overflow-y-auto`} >
      <h1>Table of Contents</h1>
      <hr />
      <div>
        <h2>Game System</h2>
        <MenuIcon imageName="dictionary" title="Core" alwaysShowText={true} />
        <div className="ml-4">
          <Link to={"/game-system/checks"} onClick={toggleContents}>
            <MenuIcon imageName="casino" title="Checks" alwaysShowText={true} />
          </Link>
        </div>
      </div>
      <hr />
      <div>
        <h2>World</h2>
      </div>
      <hr />
      <div>
        <h2>Campaign</h2>
      </div>
      <hr />
      <button className="lg:hidden self-center border-2 border-alpha rounded-sm m-1" onClick={toggleContents}>
        <MenuIcon imageName="close"></MenuIcon>
      </button>
    </nav>
  );
}
