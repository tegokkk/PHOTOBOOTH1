import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PhotoRecord } from "@/types/gallery";
import { fetchMediaObjectUrl } from "@/lib/media";

interface PhotoDetailModalProps {
  photo: PhotoRecord;
  activeTab: "active" | "trash";
  onClose: () => void;
  onDownload: (photo: PhotoRecord) => void;
  onDeleteClick: (id: string) => void;
  onRestore: (id: string) => void;
  token: string | null;
}

export function PhotoDetailModal({
  photo,
  activeTab,
  onClose,
  onDownload,
  onDeleteClick,
  onRestore,
  token,
}: PhotoDetailModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const mediaObjectUrlRef = useRef<string | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchMediaObjectUrl(photo.compositeImageUrl, token)
      .then((url) => {
        if (cancelled) {
          if (url.startsWith("blob:")) URL.revokeObjectURL(url);
          return;
        }
        if (url.startsWith("blob:")) mediaObjectUrlRef.current = url;
        setImageSrc(url);
      })
      .catch(() => {
        if (!cancelled) setImageSrc(null);
      });

    return () => {
      cancelled = true;
      if (mediaObjectUrlRef.current)
        URL.revokeObjectURL(mediaObjectUrlRef.current);
      mediaObjectUrlRef.current = null;
    };
  }, [photo.compositeImageUrl, token]);

  useEffect(() => {
    previousFocusedElementRef.current =
      document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute("disabled"));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => dialogRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusedElementRef.current?.focus();
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-detail-title"
        tabIndex={-1}
        className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl border border-[#DBEAFE] shadow-[0_24px_60px_-12px_rgba(15,23,42,0.25)] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DBEAFE] shrink-0">
          <div>
            <h3
              id="photo-detail-title"
              className="font-headline-md text-lg font-bold text-[#0F172A] flex items-center gap-2"
            >
              {activeTab === "trash" && (
                <span className="material-symbols-outlined text-red-600 text-xl">
                  delete
                </span>
              )}
              {photo.frame?.name || "Tanpa Frame"}
            </h3>
            <p className="text-xs text-[#475569]">
              {new Date(photo.createdAt).toLocaleString("id-ID")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 min-h-10 min-w-10 rounded-xl text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup detail foto"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Photo */}
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-[#F8FAFC] p-6 min-h-0">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Foto detail"
              decoding="async"
              className={`max-w-full max-h-full object-contain rounded-xl shadow-md ${
                activeTab === "trash" ? "grayscale opacity-80" : ""
              }`}
            />
          ) : (
            <div
              className="w-full h-full animate-pulse rounded-2xl bg-slate-200/70"
              aria-label="Memuat foto"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-[#DBEAFE] bg-white shrink-0">
          {activeTab === "active" ? (
            <>
              <button
                type="button"
                onClick={() => onDownload(photo)}
                className="flex-1 min-h-[48px] py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  download
                </span>
                Unduh
              </button>
              <button
                type="button"
                onClick={() => onDeleteClick(photo.id)}
                className="min-h-[48px] px-5 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold text-sm active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">
                  delete
                </span>
                Hapus
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onRestore(photo.id)}
              className="flex-1 min-h-[48px] py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                restore
              </span>
              Pulihkan Foto
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
