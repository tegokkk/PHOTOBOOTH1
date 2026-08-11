import { useEffect, useRef, useState } from "react";
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
      if (mediaObjectUrlRef.current) URL.revokeObjectURL(mediaObjectUrlRef.current);
      mediaObjectUrlRef.current = null;
    };
  }, [photo.compositeImageUrl, token]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 bg-ink-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-4 md:inset-12 lg:inset-24 z-50 bg-paper-white sketch-border shadow-[8px_8px_0_0_#0F0F0F] flex flex-col overflow-hidden">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-detail-title"
          tabIndex={-1}
          className="contents"
        >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-ink-black">
          <div>
            <h3 id="photo-detail-title" className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black flex items-center gap-2">
              {activeTab === "trash" && (
                <span className="material-symbols-outlined text-curtain-red text-xl">
                  delete
                </span>
              )}
              {photo.frame?.name || "Tanpa Frame"}
            </h3>
            <p className="font-label-caps text-label-caps text-on-surface-variant text-xs">
              {new Date(photo.createdAt).toLocaleString("id-ID")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center border-2 border-ink-black hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Photo */}
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-surface-container-highest p-4">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Foto detail"
              decoding="async"
              className={`max-w-full max-h-full object-contain sketch-border hard-shadow ${
                activeTab === "trash" ? "grayscale opacity-80" : ""
              }`}
            />
          ) : (
            <div className="w-full h-full animate-pulse bg-surface-container" aria-label="Memuat foto" />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-4 py-4 border-t-2 border-ink-black">
          {activeTab === "active" ? (
            <>
              <button
                onClick={() => onDownload(photo)}
                className="flex-1 py-3 bg-blueprint-blue text-paper-white font-label-caps text-label-caps border-2 border-ink-black sketch-border hard-shadow hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span
                  className="material-symbols-outlined text-base"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  download
                </span>
                Download
              </button>
              <button
                onClick={() => onDeleteClick(photo.id)}
                className="px-4 py-3 bg-paper-white text-curtain-red font-label-caps text-label-caps border-2 border-curtain-red sketch-border hard-shadow hover:bg-red-50 active:scale-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">
                  delete
                </span>
                Hapus
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onRestore(photo.id)}
                className="flex-1 py-3 bg-green-600 text-paper-white font-label-caps text-label-caps border-2 border-ink-black sketch-border hard-shadow hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span
                  className="material-symbols-outlined text-base"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  restore
                </span>
                Pulihkan Foto
              </button>
            </>
          )}
        </div>
        </div>
      </div>
    </>
  );
}
