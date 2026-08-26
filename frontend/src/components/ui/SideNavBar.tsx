"use client";

import Link from "next/link";

export default function SideNavBar() {
  return (
    <nav className="hidden md:flex flex-col gap-stack-md p-gutter fixed left-0 top-0 h-full z-40 border-r-4 border-ink-black w-64 shadow-[4px_0px_0px_0px_rgba(15,15,15,1)] bg-paper-white">
      <div className="mb-8 mt-4 flex flex-col gap-2">
        <Link href="/">
          <h1 className="font-headline-lg text-ink-black tracking-tight italic underline decoration-wavy hover:text-curtain-red transition-colors">
            RIRII
          </h1>
        </Link>
      </div>

      <ul className="flex flex-col gap-2 flex-grow">
        <li>
          <Link href="/" className="w-full flex items-center gap-3 text-ink-black p-2 hover:bg-surface-container-high hover:rotate-1 hover:scale-105 transition-all active:scale-95 duration-100 sketch-border-thin border-transparent hover:border-ink-black text-left">
            <span className="material-symbols-outlined">photo_camera</span>
            <span className="font-label-caps text-label-caps">Photobooth</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
