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
      if (
        event.target instanceof Element &&
        event.target.closest('[role="alertdialog"]')
      ) {
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

    const events: Array<keyof WindowEventMap> = [
      "pointerdown",
      "touchstart",
      "keydown",
    ];
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
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
    >
      <div className="w-full max-w-md bg-white rounded-[2.5rem] border-4 border-[#0038FF] shadow-[0_24px_60px_rgba(0,0,0,0.4)] p-6 md:p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#CCFF00] text-black flex items-center justify-center mx-auto shadow-md">
          <span className="material-symbols-outlined text-4xl" aria-hidden="true">
            timer
          </span>
        </div>
        <h2
          id="session-timeout-title"
          className="mt-4 text-xl md:text-2xl font-black uppercase text-black"
        >
          Sesi Akan Berakhir
        </h2>
        <p className="mt-2 text-sm text-black/70 font-medium leading-relaxed">
          Tidak ada aktivitas terdeteksi. Sesi otomatis kembali ke layar utama dalam{" "}
          <strong className="text-[#0038FF] font-black">
            {secondsRemaining} detik
          </strong>
          .
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={continueSession}
            className="min-h-[48px] py-3 px-4 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs uppercase shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Lanjutkan Sesi
          </button>
          <button
            type="button"
            onClick={endSession}
            className="min-h-[48px] py-3 px-4 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-black text-xs uppercase active:scale-95 transition-all cursor-pointer"
          >
            Akhiri Sesi
          </button>
        </div>
      </div>
    </div>
  );
}
