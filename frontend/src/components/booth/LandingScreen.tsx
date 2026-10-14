"use client";

import { useAppStore } from "@/store/useAppStore";
import { useEffect, useRef, useState } from "react";

export function LandingScreen() {
  const { resetSession, openSession } = useAppStore();
  const [isExiting, setIsExiting] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [operatorConfirmed, setOperatorConfirmed] = useState(false);
  const [operatorPin, setOperatorPin] = useState("");
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const paymentDialogRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    setOperatorConfirmed(false);
    setIsPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setOperatorConfirmed(false);
    setOperatorPin("");
  };

  const handleConfirmPayment = () => {
    if (!operatorConfirmed) return;
    setIsPaymentDialogOpen(false);
    setIsExiting(true);
    setTimeout(() => {
      resetSession();
      openSession();
    }, 300);
  };

  useEffect(() => {
    if (!isPaymentDialogOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const fallbackFocusTarget = startButtonRef.current;
    paymentDialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClosePaymentDialog();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      (previouslyFocused || fallbackFocusTarget)?.focus();
    };
  }, [isPaymentDialogOpen]);

  return (
    <main 
      className={`
        flex-grow flex flex-col items-center justify-center p-4 md:p-8 
        min-h-screen relative z-10 w-full max-w-[1440px] mx-auto overflow-hidden
        transition-all duration-300 ease-in-out
        ${isExiting ? "opacity-0 scale-95 translate-y-10" : "opacity-100 scale-100 translate-y-0"}
      `}
    >
      
      {/* 2-Column Responsive Layout: Camera Graphic Left, Action & Text Right */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 lg:gap-16 w-full max-w-5xl z-20 my-auto">
        
        {/* Cyber Doodle Graphic (Left) */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-64 md:h-64 lg:w-72 lg:h-72 group shrink-0">
          <div className="absolute inset-0 bg-cyber-purple border-border-thick border-ink-black hard-shadow-lg transform rotate-3 transition-transform duration-500 group-hover:rotate-6"></div>
          <div className="absolute inset-0 bg-stark-white border-border-thick border-ink-black -rotate-3 p-4 flex flex-col items-center justify-center transition-transform duration-500 group-hover:-rotate-6">
            {/* Doodle style camera representation */}
            <div className="w-3/4 h-2/3 border-4 border-ink-black border-dashed flex items-center justify-center relative">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-ink-black bg-neon-yellow flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-ink-black opacity-20 transform translate-x-2 translate-y-2 rounded-full"></div>
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-ink-black"></div>
              </div>
              <div className="absolute top-2 right-2 w-3 h-3 md:w-4 md:h-4 bg-error-red border-2 border-ink-black rounded-full animate-pulse"></div>
            </div>
            <div className="mt-3 font-tech-mono text-[10px] md:text-tech-mono text-ink-black uppercase tracking-widest bg-neon-yellow px-2 py-1 border-2 border-ink-black">
                SYS_CAM_01
            </div>
          </div>
        </div>

        {/* Text & Button Column (Right) */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 md:gap-5 max-w-xl">
          <h1 className="font-headline-lg-mobile text-[clamp(1.75rem,4vw,3.5rem)] text-ink-black uppercase leading-[1.02] tracking-tight drop-shadow-[4px_4px_0_rgba(255,201,0,1)]">
              ABADIKAN MOMEN,<br />
              <span className="text-cyber-purple">BUAT KENANGAN.</span>
          </h1>
          <p className="font-body-lg text-sm md:text-base leading-relaxed text-ink-black bg-stark-white p-3 md:p-4 border-2 border-ink-black hard-shadow font-bold">
              Photo booth siap digunakan. Tekan tombol untuk memulai sesi foto.
          </p>
          
          <button
            ref={startButtonRef}
            onClick={handleStart}
            className="
              mt-2 relative bg-neon-yellow text-ink-black font-label-caps text-label-caps md:font-headline-md md:text-headline-md 
              px-8 py-4 md:px-10 md:py-5 border-border-thick border-ink-black hard-shadow-lg jiggle-active transition-transform group flex items-center gap-3 z-20 pixel-corners cursor-pointer
            "
          >
            <div className="pixel-corners-inner"></div>
            <span className="material-symbols-outlined text-2xl md:text-3xl font-bold group-hover:rotate-12 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>camera</span>
            MULAI SESI FOTO
            <div className="absolute top-0 right-0 w-4 h-4 bg-stark-white border-b-border-thick border-l-border-thick border-ink-black"></div>
          </button>
        </div>

      </div>

      <div className="absolute bottom-6 right-6 hidden sm:flex gap-2 pointer-events-none">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-cyber-purple border-2 border-ink-black hard-shadow animate-pulse"></div>
        <div className="w-6 h-6 md:w-8 md:h-8 bg-error-red border-2 border-ink-black hard-shadow"></div>
        <div className="w-6 h-6 md:w-8 md:h-8 bg-stark-white border-2 border-ink-black hard-shadow"></div>
      </div>

      {isPaymentDialogOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink-black/80 backdrop-blur-sm"
            onClick={handleClosePaymentDialog}
            aria-hidden="true"
          />
          <div
            ref={paymentDialogRef}
            className="relative z-10 w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto bg-stark-white border-border-thick border-ink-black hard-shadow-lg p-6 pixel-corners"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-confirmation-title"
            aria-describedby="payment-confirmation-description"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pixel-corners-inner"></div>
            {/* Window controls decoration */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-ink-black flex items-center px-2 gap-2">
                <div className="w-3 h-3 bg-stark-white"></div>
                <div className="w-3 h-3 bg-neon-yellow"></div>
                <div className="w-3 h-3 bg-error-red"></div>
            </div>
            
            <div className="flex items-start gap-4 mt-8">
              <div className="w-12 h-12 bg-cyber-purple border-2 border-ink-black hard-shadow flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-neon-yellow text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lock
                </span>
              </div>
              <div>
                <h2 id="payment-confirmation-title" className="font-headline-md text-headline-md text-ink-black uppercase">
                  OTORISASI OPERATOR
                </h2>
                <p id="payment-confirmation-description" className="font-body-md text-body-md text-ink-black/80 mt-2 font-bold">
                  Masukkan PIN untuk membuka sesi foto baru.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col gap-2">
              <input
                type="password"
                placeholder="****"
                maxLength={8}
                value={operatorPin}
                onChange={(e) => {
                  setOperatorPin(e.target.value);
                  const correctPin = process.env.NEXT_PUBLIC_OPERATOR_PIN || "0606";
                  setOperatorConfirmed(e.target.value === correctPin);
                }}
                className="w-full bg-surface-container-highest border-2 border-ink-black px-4 py-4 text-center font-tech-mono text-2xl tracking-[0.5em] text-ink-black focus:outline-none focus:ring-4 focus:ring-neon-yellow"
                autoFocus
              />
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleClosePaymentDialog}
                className="py-4 bg-stark-white text-ink-black font-label-caps border-border-thick border-ink-black hard-shadow jiggle-active"
              >
                BATAL
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={!operatorConfirmed}
                className="py-4 bg-neon-yellow text-ink-black font-label-caps border-border-thick border-ink-black hard-shadow jiggle-active pixel-corners disabled:opacity-50 disabled:cursor-not-allowed"
              >
                BUKA SESI
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
