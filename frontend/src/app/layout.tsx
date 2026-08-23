import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import Link from "next/link";
import TopAppBar from "@/components/ui/TopAppBar";
import SideNavBar from "@/components/ui/SideNavBar";
import { GlobalDebounce } from "@/components/ui/GlobalDebounce";

export const metadata: Metadata = {
  title: "Tego Photobooth",
  description: "Capture your best moments",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-background min-h-screen flex flex-col font-body-md overflow-x-hidden selection:bg-curtain-red selection:text-paper-white">
        
        {/* Global Debounce for all clicks */}
        <GlobalDebounce />

        {/* TopAppBar */}
        <TopAppBar />

        {/* SideNavBar (Desktop Only) */}
        <SideNavBar />

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col md:ml-64 relative z-10 w-full md:w-[calc(100%-16rem)] overflow-x-hidden">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>

        {/* BottomNavBar (Mobile Only) */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-safe bg-paper-white border-t-4 border-ink-black rounded-t-full shadow-[0px_-4px_0px_0px_rgba(15,15,15,1)] h-[80px]">
          <Link href="/" className="flex flex-col items-center justify-center bg-curtain-red text-paper-white border-2 border-ink-black -translate-y-4 p-2 w-16 h-16 rounded-xl hover:bg-primary/90 transition-colors active:scale-90 duration-75 shadow-[4px_4px_0px_0px_rgba(15,15,15,1)]">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>camera</span>
            <span className="font-label-caps text-[9px] mt-0.5">Booth</span>
          </Link>
          <Link href="/gallery" className="flex flex-col items-center justify-center text-ink-black p-2 w-14 h-14 hover:bg-surface-container-low transition-colors active:scale-90 duration-75">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>photo_library</span>
            <span className="font-label-caps text-[10px] mt-1">Galeri</span>
          </Link>
          <Link href="/" className="flex flex-col items-center justify-center text-ink-black p-2 w-14 h-14 hover:bg-surface-container-low transition-colors active:scale-90 duration-75">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>filter_frames</span>
            <span className="font-label-caps text-[9px] mt-0.5">Frames</span>
          </Link>
        </nav>

        {/* Global Toast Notifications */}
        <ToastContainer />

      </body>
    </html>
  );
}
