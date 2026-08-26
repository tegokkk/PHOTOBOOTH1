"use client";

import { useEffect } from "react";
import { FrameData } from "@/store/useAppStore";
import { getFramePreviewUrl } from "@/lib/frameMeta";

interface FramePreviewDialogProps {
  frame: FrameData;
  onClose: () => void;
  onContinue: () => void;
}

export function FramePreviewDialog({ frame, onClose, onContinue }: FramePreviewDialogProps) {
  const previewUrl = getFramePreviewUrl(frame);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 bg-ink-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-x-4 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          z-50 w-auto md:w-full md:max-w-2xl bg-paper-white border-2 border-ink-black sketch-border
          shadow-[6px_6px_0_0_#0F0F0F] md:shadow-[8px_8px_0_0_#0F0F0F]
          flex flex-col max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="frame-preview-title"
      >
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b-2 border-ink-black sticky top-0 bg-paper-white z-10">
          <div>
            <h2 id="frame-preview-title" className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black">
              Preview Frame
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              Frame: <strong>{frame.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center border-2 border-ink-black hover:bg-surface-container-high transition-colors"
            aria-label="Tutup preview frame"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-5 md:p-6 space-y-4">
          <div
            className="relative w-full max-h-[62vh] overflow-hidden sketch-border hard-shadow flex items-center justify-center bg-surface-container-highest"
            style={frame.width && frame.height ? { aspectRatio: `${frame.width} / ${frame.height}` } : undefined}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={`Preview ${frame.name}`}
                className="w-full h-full max-h-[62vh] object-contain"
                decoding="async"
              />
            ) : frame.cssPlaceholder !== "border-0" ? (
              <div className={`absolute inset-0 ${frame.cssPlaceholder}`} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant">
                  crop_free
                </span>
                <p className="font-label-caps text-label-caps text-on-surface-variant mt-2">Tanpa Frame</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="font-label-caps text-label-caps text-ink-black">{frame.name}</p>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">{frame.category}</p>
          </div>
        </div>

        <div className="px-5 md:px-6 py-4 border-t-2 border-ink-black bg-surface-container-lowest sticky bottom-0 flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-1/2 py-3 bg-paper-white text-ink-black border-2 border-ink-black font-label-caps text-label-caps hover:bg-surface-container-high active:scale-95 transition-all"
          >
            Pilih Frame Lain
          </button>
          <button
            onClick={onContinue}
            className="w-full sm:w-1/2 py-3 bg-curtain-red text-paper-white border-2 border-ink-black font-interactive-btn text-interactive-btn sketch-border hard-shadow hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              photo_camera
            </span>
            Mulai Sesi Foto
          </button>
        </div>
      </div>
    </>
  );
}
