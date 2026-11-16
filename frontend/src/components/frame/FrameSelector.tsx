"use client";

import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { getFramePreviewUrl } from "@/lib/frameMeta";

export function FrameSelector() {
  const {
    selectedFrameId,
    setSelectedFrameId,
    frames,
    isLoadingFrames,
    setCurrentStep,
  } = useAppStore();

  if (isLoadingFrames) {
    return (
      <div className="p-4 text-center text-xs font-semibold text-[#2563EB] animate-pulse">
        Memuat daftar frame...
      </div>
    );
  }

  return (
    <div className="w-full mt-2">
      <div className="flex md:grid md:grid-cols-2 gap-3 overflow-x-auto md:overflow-visible no-scrollbar pb-3 md:pb-0 snap-x w-full">
        {frames.map((frame) => {
          const isSelected = selectedFrameId === frame.id;
          const previewUrl = getFramePreviewUrl(frame);
          return (
            <button
              key={frame.id}
              type="button"
              onClick={() => setSelectedFrameId(frame.id)}
              className={`snap-center shrink-0 w-28 h-36 md:w-full md:h-auto md:aspect-[3/4] relative rounded-2xl overflow-hidden border transition-all cursor-pointer ${
                isSelected
                  ? "border-2 border-[#2563EB] bg-[#EFF6FF] shadow-sm"
                  : "border-[#DBEAFE] bg-[#F8FAFC] hover:border-[#93C5FD]"
              }`}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={frame.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-contain p-2 z-10"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[11px] text-[#475569] font-medium">
                    Tanpa Frame
                  </span>
                </div>
              )}

              <div className="absolute inset-x-1.5 bottom-1.5 z-20">
                <span
                  className={`block px-2 py-1 rounded-lg text-[10px] font-semibold truncate ${
                    isSelected
                      ? "bg-[#2563EB] text-white"
                      : "bg-white/90 text-[#0F172A] border border-[#DBEAFE]"
                  }`}
                >
                  {frame.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[#DBEAFE] flex justify-center">
        <button
          type="button"
          onClick={() => setCurrentStep("frame-selection")}
          className="w-full py-2.5 px-3 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Lihat Semua Frame</span>
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
