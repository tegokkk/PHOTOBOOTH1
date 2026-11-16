"use client";

import { useUIStore, ToastMessage } from "@/store/useUIStore";
import { useEffect, useState } from "react";

function Toast({ toast }: { toast: ToastMessage }) {
  const { removeToast } = useUIStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const icons: Record<string, string> = {
    success: "check_circle",
    error: "error",
    info: "info",
    warning: "warning",
  };

  const styles: Record<string, { border: string; icon: string; badge: string }> = {
    success: {
      border: "border-[#CCFF00]",
      icon: "text-black",
      badge: "bg-[#CCFF00]",
    },
    error: {
      border: "border-red-300",
      icon: "text-white",
      badge: "bg-red-600",
    },
    info: {
      border: "border-[#0038FF]/30",
      icon: "text-white",
      badge: "bg-[#0038FF]",
    },
    warning: {
      border: "border-amber-300",
      icon: "text-black",
      badge: "bg-amber-400",
    },
  };

  const currentStyle = styles[toast.type] || styles.info;

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 border-2 rounded-full bg-white
        shadow-[0_12px_32px_rgba(0,0,0,0.22)] max-w-sm w-full
        text-black ${currentStyle.border}
        transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      role="alert"
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${currentStyle.badge}`}
      >
        <span
          className={`material-symbols-outlined text-lg ${currentStyle.icon}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icons[toast.type]}
        </span>
      </div>
      <span className="flex-1 text-xs md:text-sm font-bold leading-snug text-black">
        {toast.message}
      </span>
      <button
        onClick={() => removeToast(toast.id)}
        className="w-8 h-8 min-h-8 min-w-8 rounded-full flex items-center justify-center text-black/50 hover:text-black hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
        aria-label="Tutup notifikasi"
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
      className="fixed bottom-6 right-4 md:right-6 z-[120] flex flex-col gap-2.5 items-end max-w-[calc(100vw-2rem)]"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
