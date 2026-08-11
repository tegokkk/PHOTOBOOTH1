"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

export default function SideNavBar() {
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

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
        <li>
          <Link href="/gallery" className="w-full flex items-center gap-3 text-ink-black p-2 hover:bg-surface-container-high hover:rotate-1 hover:scale-105 transition-all active:scale-95 duration-100 sketch-border-thin border-transparent hover:border-ink-black text-left">
            <span className="material-symbols-outlined">photo_library</span>
            <span className="font-label-caps text-label-caps">Galeri Foto</span>
          </Link>
        </li>
      </ul>

      <div className="mt-auto border-t-2 border-ink-black pt-4">
        {mounted && user ? (
          <div className="flex flex-col gap-2">
            <p className="font-label-caps text-xs text-on-surface-variant truncate">
              Masuk sebagai:<br/>
              <strong className="text-ink-black text-sm">{user.fullName || user.email}</strong>
            </p>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 justify-center p-2 bg-paper-white text-curtain-red border-2 border-curtain-red sketch-border-thin hover:bg-red-50 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="font-label-caps text-label-caps">Keluar</span>
            </button>
          </div>
        ) : mounted ? (
          <Link
            href="/login"
            className="w-full flex items-center gap-2 justify-center p-2 bg-curtain-red text-paper-white border-2 border-ink-black sketch-border-thin hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">login</span>
            <span className="font-label-caps text-label-caps">Login / Daftar</span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
