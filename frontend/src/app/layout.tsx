import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import TopAppBar from "@/components/ui/TopAppBar";
import { GlobalDebounce } from "@/components/ui/GlobalDebounce";
import { SessionTimeout } from "@/components/booth/SessionTimeout";
import { AuthBootstrap } from "@/components/auth/AuthBootstrap";

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
        <SessionTimeout />
        <AuthBootstrap />

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
