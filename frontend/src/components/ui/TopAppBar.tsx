"use client";

import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

export default function TopAppBar() {
  const pathname = usePathname();
  const currentStep = useAppStore((state) => state.currentStep);

  // Booth steps render their own full-width header. Keeping the global bar on
  // those screens creates a duplicate header on mobile.
  if (pathname.startsWith("/share") || (pathname === "/" && currentStep !== "landing")) {
    return null;
  }

  return (
    <header
      className="bg-paper-white flex justify-between items-center px-gutter py-stack-sm w-full sticky top-0 z-50 border-b-4 border-ink-black shadow-[4px_4px_0px_0px_rgba(15,15,15,1)] md:hidden"
      aria-label="Navigasi utama"
    >
      <div className="flex items-center gap-2">
        <span className="font-headline-lg-mobile text-headline-lg-mobile text-curtain-red italic underline decoration-wavy">RIRI</span>
      </div>
    </header>
  );
}
