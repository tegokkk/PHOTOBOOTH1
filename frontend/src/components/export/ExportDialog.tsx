"use client";

import { useState, useEffect, useRef } from "react";
import { useUIStore } from "@/store/useUIStore";
import { QRCodeSVG } from "qrcode.react";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  compositeDataUrl: string | null; // The final composited image
  frameName: string;
  onDownloadLocal: (format: "png" | "jpg") => Promise<void>;
  onCreateShareLink: () => Promise<string | undefined>;
}

export function ExportDialog({
  isOpen,
  onClose,
  compositeDataUrl,
  frameName,
  onDownloadLocal,
  onCreateShareLink,
}: ExportDialogProps) {
  const { showToast } = useUIStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [shareLink, setShareLink] = useState<{ token: string; expiresAt?: string | null } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownloadLocal = async (format: "png" | "jpg") => {
    try {
      await onDownloadLocal(format);
      showToast("Foto diunduh ke perangkat (lokal)", "success");
    } catch {
      showToast("Gagal mengunduh foto", "error");
    }
  };

  const handleCreateShareLink = async () => {
    if (!compositeDataUrl || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsProcessing(true);
    try {
      const token = await onCreateShareLink();
      if (!token) throw new Error("Gagal membuat tautan.");
      setShareLink({ token });
      showToast("Tautan bagikan berhasil dibuat!", "success");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal memproses bagikan foto.";
      showToast(message, "error");
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  };

  const fullShareUrl = shareLink
    ? `${window.location.origin}/share/${encodeURIComponent(shareLink.token)}`
    : "";

  const handleWebShare = async () => {
    if (!fullShareUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Foto Photobooth! 📸",
          text: `Lihat foto photobooth aku dengan frame ${frameName}!`,
          url: fullShareUrl,
        });
      } else {
        navigator.clipboard.writeText(fullShareUrl);
        showToast("Link disalin ke clipboard!", "info");
      }
    } catch (err: unknown) {
      const name = err && typeof err === "object" && "name" in err ? String(err.name) : "";
      if (name !== "AbortError") {
        showToast("Gagal membagikan foto.", "error");
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-ink-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-lg bg-stark-white border-border-thick border-ink-black pixel-corners hard-shadow-lg
          flex flex-col max-h-[calc(100vh-2rem)] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        tabIndex={-1}
      >
        <div className="pixel-corners-inner"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-border-thick border-ink-black sticky top-0 bg-ink-black text-stark-white z-10">
          <div className="flex flex-col">
            <h2 id="share-dialog-title" className="font-tech-mono font-bold text-lg uppercase tracking-widest text-neon-yellow">SHARE_SYS</h2>
            <p className="font-tech-mono text-[10px] text-on-surface-variant uppercase">TARGET_FRAME: {frameName}</p>
          </div>
          <button onClick={onClose} aria-label="Tutup dialog bagikan" className="w-10 h-10 flex items-center justify-center border-2 border-stark-white bg-error-red text-stark-white hover:bg-error-red/80 transition-colors jiggle-active">
            <span className="material-symbols-outlined font-bold">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 bg-stark-white">
          {/* If a share link exists, show QR Code instead of Preview */}
          {shareLink ? (
            <div className="flex flex-col items-center gap-4 bg-surface-container-highest p-6 border-border-thick border-ink-black text-center pixel-corners">
              <div className="pixel-corners-inner"></div>
              <h3 className="font-tech-mono text-neon-yellow text-lg uppercase font-bold">SCAN_TO_DOWNLOAD</h3>
              <div className="bg-stark-white p-4 border-border-thick border-ink-black hard-shadow-sm">
                <QRCodeSVG value={fullShareUrl} size={180} />
              </div>
              <p className="font-tech-mono text-[10px] text-on-surface-variant uppercase">
                LINK EXPIRES IN 7 DAYS. SAVE IMMEDIATELY.
              </p>
              
              <div className="flex flex-col gap-3 w-full mt-4">
                <button
                  onClick={handleWebShare}
                  className="w-full px-4 py-4 bg-neon-yellow text-ink-black font-tech-mono font-bold border-border-thick border-ink-black hard-shadow-sm hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>share</span>
                  SHARE_LINK
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(fullShareUrl);
                    showToast("Link copied!", "success");
                  }}
                  className="w-full px-4 py-4 bg-stark-white text-ink-black font-tech-mono font-bold border-border-thick border-ink-black hard-shadow-sm hover:bg-surface-container-low active:scale-95 transition-all flex items-center justify-center gap-2 uppercase"
                >
                  <span className="material-symbols-outlined">content_copy</span>
                  COPY_LINK
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Normal Preview & Actions */}
              {compositeDataUrl && (
                <div className="relative w-full max-h-48 overflow-hidden border-border-thick border-ink-black hard-shadow flex items-center justify-center bg-surface-container-highest pixel-corners p-2">
                  <div className="pixel-corners-inner"></div>
                  <img src={compositeDataUrl} alt="Preview foto" decoding="async" className="w-full h-full object-contain relative z-10" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-tech-mono text-ink-black border-b-2 border-ink-black pb-2 mb-4 font-bold uppercase tracking-widest text-sm">
                    LOCAL_STORAGE
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleDownloadLocal("png")}
                      disabled={isProcessing}
                      className="px-3 py-4 bg-stark-white text-ink-black border-border-thick border-ink-black hard-shadow hover:bg-surface-container-high active:scale-95 transition-all flex flex-col items-center justify-center gap-2 font-tech-mono font-bold text-[10px] disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                    >
                      <span className="material-symbols-outlined text-2xl">image</span>
                      PNG (HI-RES)
                    </button>
                    <button
                      onClick={() => handleDownloadLocal("jpg")}
                      disabled={isProcessing}
                      className="px-3 py-4 bg-stark-white text-ink-black border-border-thick border-ink-black hard-shadow hover:bg-surface-container-high active:scale-95 transition-all flex flex-col items-center justify-center gap-2 font-tech-mono font-bold text-[10px] disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                    >
                      <span className="material-symbols-outlined text-2xl">photo</span>
                      JPG (COMPRESSED)
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-tech-mono text-ink-black border-b-2 border-ink-black pb-2 mb-4 font-bold uppercase tracking-widest text-sm">
                    CLOUD_NETWORK
                  </h3>
                  <button
                    onClick={handleCreateShareLink}
                    disabled={isProcessing}
                    className="w-full px-4 py-4 bg-cyber-purple text-neon-yellow font-tech-mono font-bold border-border-thick border-ink-black hard-shadow hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-3 uppercase text-sm"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-neon-yellow border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
                    )}
                    {isProcessing ? "UPLOADING..." : "GENERATE QR LINK"}
                  </button>
                  <p className="font-tech-mono text-[10px] text-on-surface-variant text-center mt-3 uppercase">
                    UPLOADS TO CLOUD SECURE SERVER FOR SHARING.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
