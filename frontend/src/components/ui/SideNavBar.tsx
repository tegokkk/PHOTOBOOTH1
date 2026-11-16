"use client";

import Link from "next/link";

export default function SideNavBar() {
  return (
    <nav className="hidden md:flex flex-col gap-4 p-5 fixed left-0 top-0 h-full z-40 border-r border-[#DBEAFE] w-64 bg-white shadow-xs">
      <div className="mb-6 mt-2 flex flex-col gap-1">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              photo_camera
            </span>
          </div>
          <span className="font-headline-md font-bold text-lg text-[#0F172A] tracking-tight">
            POINTER
          </span>
        </Link>
      </div>

      <ul className="flex flex-col gap-1.5 flex-grow">
        <li>
          <Link
            href="/"
            className="w-full flex items-center gap-3 text-[#0F172A] px-3.5 py-3 rounded-xl hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors font-semibold text-sm"
          >
            <span className="material-symbols-outlined text-xl">photo_camera</span>
            <span>Photobooth</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
