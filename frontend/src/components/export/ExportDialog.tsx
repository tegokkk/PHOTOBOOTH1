"use client";

import { useState, useEffect, useRef } from "react";
import { useUIStore } from "@/store/useUIStore";
import { QRCodeSVG } from "qrcode.react";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  compositeDataUrl: string | null;
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
  const [shareLink, setShareLink] = useState<{
    token: string;
    expiresAt?: string | null;
  } | null>(null);

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
      showToast("Foto berhasil diunduh ke perangkat", "success");
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
      showToast("Tautan QR berhasil dibuat!", "success");
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Gagal memproses tautan foto.";
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
          title: "Foto Pointer Photobooth! 📸",
          text: `Lihat foto photobooth aku dengan bingkai ${frameName}!`,
          url: fullShareUrl,
        });
      } else {
        navigator.clipboard.writeText(fullShareUrl);
        showToast("Tautan disalin ke clipboard!", "info");
      }
    } catch (err: unknown) {
      const name =
        err && typeof err === "object" && "name" in err ? String(err.name) : "";
      if (name !== "AbortError") {
        showToast("Gagal membagikan foto.", "error");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-lg bg-white rounded-[2.5rem] border-4 border-[#0038FF] shadow-[0_24px_60px_rgba(0,0,0,0.4)] flex flex-col max-h-[calc(100vh-2rem)] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                qr_code_2
              </span>
            </div>
            <div className="min-w-0">
              <h2
                id="share-dialog-title"
                className="text-lg font-black uppercase text-black"
              >
                Bagikan & Unduh Foto
              </h2>
              <p className="text-xs font-semibold text-black/55 truncate">
                Bingkai: {frameName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog bagikan"
            className="w-10 h-10 min-h-10 min-w-10 rounded-full bg-[#F8F9FA] hover:bg-gray-200 text-black flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6 bg-white">
          {shareLink ? (
            <div className="flex flex-col items-center gap-4 bg-[#0038FF] p-6 rounded-[2rem] text-center text-white">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#CCFF00] text-black text-xs font-black uppercase">
                <span className="material-symbols-outlined text-sm">
                  qr_code_scanner
                </span>
                Pindai QR untuk Mengunduh
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <QRCodeSVG value={fullShareUrl} size={184} />
              </div>
              <p className="text-xs font-medium text-white/80">
                Arahkan kamera ponselmu ke kode QR di atas untuk menyimpan foto.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-2">
                <button
                  type="button"
                  onClick={handleWebShare}
                  className="min-h-[48px] px-4 py-3 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span
                    className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    share
                  </span>
                  Bagikan Tautan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(fullShareUrl);
                    showToast("Tautan berhasil disalin!", "success");
                  }}
                  className="min-h-[48px] px-4 py-3 rounded-full bg-white hover:bg-gray-100 text-black font-black text-xs uppercase active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg text-[#0038FF]">
                    content_copy
                  </span>
                  Salin Tautan
                </button>
              </div>
            </div>
          ) : (
            <>
              {compositeDataUrl && (
                <div className="relative w-full max-h-52 overflow-hidden rounded-[1.5rem] border border-gray-100 bg-[#F8F9FA] p-3 flex items-center justify-center">
                  <img
                    src={compositeDataUrl}
                    alt="Preview foto"
                    decoding="async"
                    className="max-w-full max-h-44 w-auto h-auto object-contain drop-shadow-sm"
                  />
                </div>
              )}

              <div className="space-y-5">
                <div className="rounded-[1.5rem] bg-[#0038FF] p-5 space-y-3 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base text-[#CCFF00]">
                        cloud_upload
                      </span>
                      Bagikan ke Ponsel (QR Code)
                    </span>
                    <span className="text-[10px] font-black uppercase bg-[#CCFF00] text-black px-2.5 py-0.5 rounded-full">
                      Rekomendasi
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateShareLink}
                    disabled={isProcessing}
                    className="w-full min-h-[50px] px-4 py-3 rounded-full bg-[#CCFF00] hover:bg-white text-black hover:text-[#0038FF] font-black text-xs uppercase shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span
                        className="material-symbols-outlined text-xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        qr_code_2
                      </span>
                    )}
                    <span>
                      {isProcessing
                        ? "Membuat Kode QR..."
                        : "Buat Kode QR & Tautan Unduh"}
                    </span>
                  </button>
                </div>

                <div>
                  <h3 className="text-xs font-black uppercase text-black/55 mb-2.5">
                    Simpan Langsung ke Perangkat Ini
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleDownloadLocal("png")}
                      disabled={isProcessing}
                      className="min-h-[54px] px-4 py-3 rounded-full bg-[#F8F9FA] hover:bg-[#0038FF] text-black hover:text-white border border-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2 font-black text-xs uppercase disabled:opacity-50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xl">
                        image
                      </span>
                      Unduh PNG
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadLocal("jpg")}
                      disabled={isProcessing}
                      className="min-h-[54px] px-4 py-3 rounded-full bg-[#F8F9FA] hover:bg-[#0038FF] text-black hover:text-white border border-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2 font-black text-xs uppercase disabled:opacity-50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xl">
                        photo
                      </span>
                      Unduh JPG
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
