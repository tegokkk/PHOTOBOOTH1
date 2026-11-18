import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import TopAppBar from "@/components/ui/TopAppBar";
import { GlobalDebounce } from "@/components/ui/GlobalDebounce";
import { SessionTimeout } from "@/components/booth/SessionTimeout";

export const metadata: Metadata = {
  title: "Pointer Photobooth Studio",
  description: "Studio Photobooth Digital Modern — Abadikan Momen Terbaikmu",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/pointer-photobooth-icon.svg", type: "image/svg+xml" },
      { url: "/pointer-photobooth-logo.png", type: "image/png" },
    ],
    apple: "/pointer-photobooth-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-[#F8FAFC] text-[#0F172A] overflow-x-hidden">
        {/* Global Debounce for all clicks */}
        <GlobalDebounce />
        <SessionTimeout />

        {/* TopAppBar */}
        <TopAppBar />

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col relative z-10 w-full overflow-x-hidden">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>

        {/* Global Toast Notifications */}
        <ToastContainer />
      </body>
    </html>
  );
}
