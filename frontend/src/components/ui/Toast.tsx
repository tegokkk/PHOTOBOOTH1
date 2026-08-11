"use client";

import { useUIStore, ToastMessage } from "@/store/useUIStore";
import { useEffect, useState } from "react";

function Toast({ toast }: { toast: ToastMessage }) {
  const { removeToast } = useUIStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mount animation
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const icons: Record<string, string> = {
    success: "check_circle",
    error: "error",
    info: "info",
    warning: "warning",
  };



  const iconColors: Record<string, string> = {
    success: "text-green-600",
    error: "text-curtain-red",
    info: "text-blue-500",
    warning: "text-yellow-600",
  };

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 border-2 border-ink-black
        sketch-border hard-shadow max-w-sm w-full
        font-label-caps text-label-caps text-ink-black bg-paper-white
        transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      role="alert"
    >
      <span
        className={`material-symbols-outlined text-xl shrink-0 ${iconColors[toast.type]}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icons[toast.type]}
      </span>
      <span className="flex-1 text-sm">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-on-surface-variant hover:text-ink-black transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-[100px] md:bottom-6 right-6 z-[100] flex flex-col gap-2 items-end"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
