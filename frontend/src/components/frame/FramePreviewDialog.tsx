"use client";

import { useEffect, useRef } from "react";
import { FrameData } from "@/store/useAppStore";
import { getFramePreviewUrl, getPhotoCount } from "@/lib/frameMeta";

interface FramePreviewDialogProps {
  frame: FrameData;
  onClose: () => void;
  onContinue: () => void;
}

export function FramePreviewDialog({
  frame,
  onClose,
  onContinue,
}: FramePreviewDialogProps) {
  const previewUrl = getFramePreviewUrl(frame);
  const dialogRef = useRef<HTMLDivElement>(null);
  const photoCount = previewUrl
    ? getPhotoCount(previewUrl)
    : frame.slots?.length || 1;

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
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-xl max-h-[calc(100vh-2rem)] bg-white rounded-[2.5rem] border-4 border-[#0038FF] shadow-[0_24px_60px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="frame-preview-title"
        aria-describedby="frame-preview-description"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                filter_frames
              </span>
            </div>
            <div className="min-w-0">
              <h2
                id="frame-preview-title"
                className="text-lg font-black uppercase text-black truncate"
              >
                {frame.name}
              </h2>
              <p className="text-xs font-semibold text-black/55">
                Pratinjau Bingkai • {photoCount} Slot Pose
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 min-h-10 min-w-10 rounded-full bg-[#F8F9FA] hover:bg-gray-200 text-black flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup pratinjau frame"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 md:p-6 space-y-5 overflow-y-auto">
          <div className="relative w-full min-h-[260px] max-h-[50vh] rounded-[1.5rem] border border-gray-100 bg-[#F8F9FA] p-4 flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={`Preview ${frame.name}`}
                className="max-w-full max-h-[46vh] w-auto h-auto object-contain drop-shadow-md"
                decoding="async"
              />
            ) : frame.cssPlaceholder !== "border-0" ? (
              <div className={`w-48 h-64 rounded-xl ${frame.cssPlaceholder}`} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-black/60">
                <span className="material-symbols-outlined text-5xl text-[#0038FF]">
                  crop_free
                </span>
                <p className="text-sm font-bold mt-2">Tanpa Bingkai</p>
              </div>
            )}
          </div>

          <p
            id="frame-preview-description"
            className="text-center text-xs md:text-sm font-semibold text-black/65"
          >
            Pastikan bingkai ini sudah sesuai keinginanmu sebelum mulai mengambil foto.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[#F8F9FA] p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-black/50">
                Nama Frame
              </p>
              <p className="text-xs md:text-sm font-black text-black mt-0.5 truncate">
                {frame.name}
              </p>
            </div>
            <div className="rounded-2xl bg-[#F8F9FA] p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-black/50">
                Kategori
              </p>
              <p className="text-xs md:text-sm font-black text-black mt-0.5 truncate">
                {frame.category || "Umum"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#CCFF00] p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-black/65">
                Jumlah Pose
              </p>
              <p className="text-xs md:text-sm font-black text-black mt-0.5">
                {photoCount} Foto
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-1/2 min-h-[48px] py-3 px-4 rounded-full bg-[#F8F9FA] hover:bg-gray-200 text-black font-black text-xs uppercase transition-all cursor-pointer"
          >
            Pilih Frame Lain
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="w-full sm:w-1/2 min-h-[48px] py-3 px-4 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs uppercase shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              photo_camera
            </span>
            Mulai Sesi Foto
          </button>
        </div>
      </div>
    </div>
  );
}
