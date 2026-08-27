"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useUIStore } from "@/store/useUIStore";

const SESSION_TIMEOUT_MS = 90_000;
const SESSION_WARNING_MS = 15_000;

/** Returns an unattended kiosk to the landing screen before the next guest arrives. */
export function SessionTimeout() {
  const currentStep = useAppStore((state) => state.currentStep);
  const resetSession = useAppStore((state) => state.resetSession);
  const showToast = useUIStore((state) => state.showToast);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const lastActivityRef = useRef<number | null>(null);

  useEffect(() => {
    if (currentStep === "landing") return;

    lastActivityRef.current = Date.now();
    const markActivity = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('[role="alertdialog"]')) {
        return;
      }
      lastActivityRef.current = Date.now();
      setSecondsRemaining(null);
    };

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - (lastActivityRef.current ?? Date.now());
      const remaining = SESSION_TIMEOUT_MS - elapsed;

      if (remaining <= 0) {
        setSecondsRemaining(null);
        resetSession();
        showToast("Sesi direset karena terlalu lama tidak digunakan.", "info");
        return;
      }

      setSecondsRemaining(
        remaining <= SESSION_WARNING_MS ? Math.ceil(remaining / 1000) : null
      );
    }, 1000);

    const events: Array<keyof WindowEventMap> = ["pointerdown", "touchstart", "keydown"];
    events.forEach((event) => window.addEventListener(event, markActivity));

    return () => {
      window.clearInterval(intervalId);
      events.forEach((event) => window.removeEventListener(event, markActivity));
    };
  }, [currentStep, resetSession, showToast]);

  if (currentStep === "landing" || secondsRemaining === null) return null;

  const continueSession = () => {
    lastActivityRef.current = Date.now();
    setSecondsRemaining(null);
  };

  const endSession = () => {
    setSecondsRemaining(null);
    resetSession();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink-black/60 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
    >
      <div className="w-full max-w-md bg-paper-white border-border-thick border-ink-black hard-shadow-lg p-6 text-center">
        <span className="material-symbols-outlined text-5xl text-curtain-red" aria-hidden="true">timer</span>
        <h2 id="session-timeout-title" className="mt-3 font-headline-lg-mobile text-headline-lg-mobile text-ink-black uppercase">
          Sesi akan berakhir
        </h2>
        <p className="mt-2 font-body-md text-on-surface-variant">
          Tidak ada aktivitas. Sesi akan direset dalam <strong className="text-ink-black">{secondsRemaining} detik</strong>.
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={continueSession}
            className="py-3 bg-neon-yellow text-ink-black font-label-caps text-label-caps font-bold border-border-thick border-ink-black hard-shadow jiggle-active"
          >
            LANJUTKAN SESI
          </button>
          <button
            type="button"
            onClick={endSession}
            className="py-3 bg-error-red text-stark-white font-label-caps text-label-caps font-bold border-border-thick border-ink-black hard-shadow jiggle-active"
          >
            AKHIRI SESI
          </button>
        </div>
      </div>
    </div>
  );
}
