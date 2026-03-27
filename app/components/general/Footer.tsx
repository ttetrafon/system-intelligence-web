import { version } from '../../../package.json';

export default function Footer() {
  return (
    <footer className="flex flex-row flex-nowrap items-center justify-end gap-1 w-full p-2 text-sm rounded-lg bg-base border-t border-background">
      <span className='flex-0 whitespace-nowrap' id="copyright">{`Copyright © 2025-${new Date().getFullYear()}`}</span>
      <span className='flex-0 whitespace-nowrap' id="version">(version {version})</span>
    </footer>
  );
}
