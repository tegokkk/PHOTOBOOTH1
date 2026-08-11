"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

export default function TopAppBar() {
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  return (
    <header className="bg-paper-white flex justify-between items-center px-gutter py-stack-sm w-full sticky top-0 z-50 border-b-4 border-ink-black shadow-[4px_4px_0px_0px_rgba(15,15,15,1)] md:hidden">
      <div className="flex items-center gap-2">
        <span className="font-headline-lg-mobile text-headline-lg-mobile text-curtain-red italic underline decoration-wavy">RIRII</span>
      </div>
      <div className="flex gap-2 items-center">
        {mounted && user ? (
          <div className="flex items-center gap-3">
            <span className="font-label-caps text-xs text-ink-black max-w-[80px] truncate">
              Hi, {user.fullName || user.email.split('@')[0]}
            </span>
            <button onClick={logout} className="text-curtain-red hover:skew-x-2 transition-transform p-2 sketch-border-thin bg-paper-white flex items-center gap-1" aria-label="Logout">
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        ) : mounted ? (
          <Link href="/login" className="text-ink-black hover:skew-x-2 transition-transform p-2 sketch-border-thin bg-paper-white flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">login</span>
            <span className="font-label-caps text-[11px] hidden sm:block">Login</span>
          </Link>
        ) : null}
        <Link href="/gallery" aria-label="Galeri Foto" className="text-ink-black hover:skew-x-2 transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none p-2 sketch-border-thin bg-paper-white flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>photo_library</span>
          <span className="font-label-caps text-[11px] hidden sm:block">Galeri</span>
        </Link>
      </div>
    </header>
  );
}
