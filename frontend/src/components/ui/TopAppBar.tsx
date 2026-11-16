"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopAppBar() {
  const pathname = usePathname();

  // Booth screens (Landing, Frame Selection, Camera, Preview) render their own hero/booth navbar.
  if (pathname === "/") {
    return null;
  }

  return (
    <header
      className="bg-[#0038FF] flex justify-between items-center px-6 py-4 md:px-10 md:py-5 w-full sticky top-0 z-50 border-b border-white/15"
      aria-label="Navigasi utama"
    >
      <Link href="/" className="flex items-center gap-1.5 group min-h-[44px]">
        <div className="bg-white text-black font-black tracking-tight text-xs md:text-sm px-3.5 py-1.5 rounded-2xl rounded-bl-sm relative shadow-sm">
          POINTER
          <div
            className="absolute -bottom-1.5 left-0 w-3 h-3 bg-white"
            style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
          />
        </div>
        <div className="bg-[#CCFF00] text-black font-black text-xs md:text-sm px-3.5 py-1.5 rounded-full border-[1.5px] border-white shadow-sm">
          BOOTH
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="px-5 py-2 rounded-full border border-white text-white text-xs md:text-sm font-bold hover:bg-[#CCFF00] hover:text-black hover:border-[#CCFF00] transition-colors flex items-center gap-1.5"
        >
          <span>Kembali ke Studio</span>
        </Link>
      </div>
    </header>
  );
}
