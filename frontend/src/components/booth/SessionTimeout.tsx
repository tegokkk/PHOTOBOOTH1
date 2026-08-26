"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useUIStore } from "@/store/useUIStore";

const SESSION_TIMEOUT_MS = 90_000;

/** Returns an unattended kiosk to the landing screen before the next guest arrives. */
export function SessionTimeout() {
  const currentStep = useAppStore((state) => state.currentStep);
  const resetSession = useAppStore((state) => state.resetSession);
  const showToast = useUIStore((state) => state.showToast);

  useEffect(() => {
    if (currentStep === "landing") return;

    let timeoutId = window.setTimeout(() => {
      resetSession();
      showToast("Sesi direset karena terlalu lama tidak digunakan.", "info");
    }, SESSION_TIMEOUT_MS);

    const restartTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        resetSession();
        showToast("Sesi direset karena terlalu lama tidak digunakan.", "info");
      }, SESSION_TIMEOUT_MS);
    };

    const events: Array<keyof WindowEventMap> = ["pointerdown", "touchstart", "keydown"];
    events.forEach((event) => window.addEventListener(event, restartTimer));

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, restartTimer));
    };
  }, [currentStep, resetSession, showToast]);

  return null;
}
