"use client";

import { useEffect, useRef } from "react";
import { FrameData } from "@/store/useAppStore";
import { getFramePreviewUrl, getPhotoCount } from "@/lib/frameMeta";

interface FramePreviewDialogProps {
  frame: FrameData;
  onClose: () => void;
  onContinue: () => void;
}

export function FramePreviewDialog({ frame, onClose, onContinue }: FramePreviewDialogProps) {
  const previewUrl = getFramePreviewUrl(frame);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-2xl max-h-[calc(100vh-2rem)] bg-stark-white border-border-thick border-ink-black pixel-corners
          hard-shadow-lg
          flex flex-col overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="frame-preview-title"
        aria-describedby="frame-preview-description"
        tabIndex={-1}
      >
        <div className="pixel-corners-inner"></div>

        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b-border-thick border-ink-black sticky top-0 bg-ink-black text-stark-white z-10">
          <div className="flex items-center gap-3">
            <div className="flex gap-1" aria-hidden="true">
              <div className="w-3 h-3 bg-stark-white"></div>
              <div className="w-3 h-3 bg-neon-yellow"></div>
              <div className="w-3 h-3 bg-error-red"></div>
            </div>
            <div>
              <h2 id="frame-preview-title" className="font-headline-md text-headline-md text-neon-yellow uppercase leading-tight">
                PRATINJAU FRAME
              </h2>
              <p className="font-tech-mono text-tech-mono text-stark-white/80 uppercase mt-1">
                Pilihan: {frame.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center border-2 border-stark-white bg-error-red text-stark-white hover:bg-error-red/80 transition-colors jiggle-active"
            aria-label="Tutup preview frame"
          >
            <span className="material-symbols-outlined font-bold">close</span>
          </button>
        </div>

        <div className="p-5 md:p-6 space-y-5 bg-stark-white">
          <div
            className="relative w-full min-h-[260px] max-h-[58vh] overflow-hidden border-border-thick border-ink-black hard-shadow-sm flex items-center justify-center bg-surface-container-highest"
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
                <p className="font-label-caps text-label-caps text-on-surface-variant mt-2">TANPA FRAME</p>
              </div>
            )}
          </div>

          <p id="frame-preview-description" className="text-center font-body-md text-base leading-relaxed text-ink-black/80 font-bold">
            Pastikan frame ini sudah sesuai. Lanjutkan untuk mengambil foto dengan frame pilihanmu.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="border-2 border-ink-black bg-surface-container-highest p-3">
              <p className="font-tech-mono text-[10px] text-on-surface-variant uppercase">Nama Frame</p>
              <p className="font-tech-mono text-sm text-ink-black font-bold uppercase mt-1 truncate">{frame.name}</p>
            </div>
            <div className="border-2 border-ink-black bg-surface-container-highest p-3">
              <p className="font-tech-mono text-[10px] text-on-surface-variant uppercase">Kategori</p>
              <p className="font-tech-mono text-sm text-ink-black font-bold uppercase mt-1 truncate">{frame.category || "Umum"}</p>
            </div>
            <div className="border-2 border-ink-black bg-surface-container-highest p-3">
              <p className="font-tech-mono text-[10px] text-on-surface-variant uppercase">Jumlah Foto</p>
              <p className="font-tech-mono text-sm text-ink-black font-bold uppercase mt-1">{previewUrl ? getPhotoCount(previewUrl) : "?"} FOTO</p>
            </div>
          </div>
        </div>

        <div className="px-5 md:px-6 py-4 border-t-border-thick border-ink-black bg-ink-black sticky bottom-0 flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-1/2 py-4 bg-stark-white text-ink-black border-2 border-ink-black font-tech-mono font-bold text-sm uppercase hover:bg-surface-container-high active:scale-95 transition-all"
          >
            PILIH FRAME LAIN
          </button>
          <button
            onClick={onContinue}
            className="w-full sm:w-1/2 py-4 bg-neon-yellow text-ink-black border-2 border-ink-black font-tech-mono font-bold text-sm uppercase hard-shadow-sm hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              photo_camera
            </span>
            MULAI SESI FOTO
          </button>
        </div>
      </div>
    </div>
  );
}
