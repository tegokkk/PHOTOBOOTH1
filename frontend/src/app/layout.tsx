import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import TopAppBar from "@/components/ui/TopAppBar";
import { GlobalDebounce } from "@/components/ui/GlobalDebounce";
import { SessionTimeout } from "@/components/booth/SessionTimeout";
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
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@10..48,400;10..48,500;10..48,600;10..48,700;10..48,800&family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col font-tech-mono overflow-x-hidden">
        
        {/* Global Debounce for all clicks */}
        <GlobalDebounce />
        <SessionTimeout />

        {/* TopAppBar */}
        <TopAppBar />

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col relative z-10 w-full overflow-x-hidden">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>

        {/* Global Toast Notifications */}
        <ToastContainer />

      </body>
    </html>
  );
}
