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
  const [shareLink, setShareLink] = useState<{ token: string; expiresAt?: string | null } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
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
      <div className="fixed inset-0 bg-ink-black/40 backdrop-blur-sm z-50" onClick={onClose} aria-hidden="true" />
      <div
        className="fixed inset-x-4 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          z-50 w-full md:max-w-lg bg-paper-white border-2 border-ink-black sketch-border
          shadow-[6px_6px_0_0_#0F0F0F] md:shadow-[8px_8px_0_0_#0F0F0F]
          flex flex-col max-h-[90vh] overflow-y-auto"
        role="dialog"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-ink-black sticky top-0 bg-paper-white z-10">
          <div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black">QR & Download</h2>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">Frame: <strong>{frameName}</strong></p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center border-2 border-ink-black hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* If a share link exists, show QR Code instead of Preview */}
          {shareLink ? (
            <div className="flex flex-col items-center gap-4 bg-surface-container-lowest p-6 sketch-border border-2 border-ink-black text-center">
              <h3 className="font-label-caps text-label-caps text-ink-black text-lg">Pindai untuk Mengunduh</h3>
              <div className="bg-white p-4 border-2 border-ink-black hard-shadow-sm">
                <QRCodeSVG value={fullShareUrl} size={150} />
              </div>
              <p className="text-xs text-on-surface-variant">
                Tautan berlaku 7 hari. Simpan atau bagikan sebelum masa berlaku habis.
              </p>
              
              <div className="flex flex-col gap-2 w-full mt-2">
                <button
                  onClick={handleWebShare}
                  className="w-full px-4 py-3 bg-blueprint-blue text-paper-white font-interactive-btn border-2 border-ink-black sketch-border hard-shadow hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>share</span>
                  Bagikan Tautan
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(fullShareUrl);
                    showToast("Link disalin!", "success");
                  }}
                  className="w-full px-4 py-3 bg-paper-white text-ink-black font-interactive-btn border-2 border-ink-black sketch-border hard-shadow hover:bg-surface-container-low active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">content_copy</span>
                  Salin Tautan
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Normal Preview & Actions */}
              {compositeDataUrl && (
                <div className="relative w-full max-h-48 overflow-hidden sketch-border hard-shadow flex items-center justify-center bg-surface-container-highest">
                  <img src={compositeDataUrl} alt="Preview foto" decoding="async" className="w-full h-full object-contain" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-label-caps text-label-caps text-ink-black border-b border-outline-variant pb-2 mb-3">
                    SIMPAN LOKAL (TANPA INTERNET)
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDownloadLocal("png")}
                      disabled={isProcessing}
                      className="px-3 py-3 bg-paper-white text-ink-black border-2 border-ink-black sketch-border-thin hover:bg-surface-container-high active:scale-95 transition-all flex flex-col items-center gap-1 font-label-caps text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-xl">image</span>
                      PNG (High Res)
                    </button>
                    <button
                      onClick={() => handleDownloadLocal("jpg")}
                      disabled={isProcessing}
                      className="px-3 py-3 bg-paper-white text-ink-black border-2 border-ink-black sketch-border-thin hover:bg-surface-container-high active:scale-95 transition-all flex flex-col items-center gap-1 font-label-caps text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-xl">photo</span>
                      JPG (Kecil)
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-label-caps text-label-caps text-ink-black border-b border-outline-variant pb-2 mb-3">
                    SIMPAN ONLINE & BAGIKAN
                  </h3>
                  <button
                    onClick={handleCreateShareLink}
                    disabled={isProcessing}
                    className="w-full px-4 py-4 bg-blueprint-blue text-paper-white font-interactive-btn text-interactive-btn border-2 border-ink-black sketch-border hard-shadow hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-paper-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
                    )}
                    {isProcessing ? "Menyimpan ke Cloud..." : "Buat Tautan (QR Code)"}
                  </button>
                  <p className="text-xs text-on-surface-variant text-center mt-2">
                    Foto akan disimpan ke awan dan Anda bisa membagikannya lewat QR/WhatsApp.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-ink-black bg-surface-container-lowest sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-paper-white text-ink-black border-2 border-ink-black font-label-caps text-label-caps hover:bg-surface-container-high transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </>
  );
}
