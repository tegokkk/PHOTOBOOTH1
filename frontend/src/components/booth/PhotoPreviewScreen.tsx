"use client";

import { useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useUIStore } from "@/store/useUIStore";
import { FrameSelector } from "@/components/frame/FrameSelector";
import { EditPanel } from "@/components/editor/EditPanel";
import { ExportDialog } from "@/components/export/ExportDialog";
import { PrintPreviewDialog } from "@/components/print/PrintPreviewDialog";
import { compositeAndDownload, compositeToDataUrl } from "@/lib/compositor";
import { getFrameMetaFromFrame, getFramePreviewUrl } from "@/lib/frameMeta";
import { useAuthStore } from "@/store/useAuthStore";
import { API_URL } from "@/lib/api";

function createIdempotencyKey(): string {
  if (typeof crypto === "undefined") throw new Error("Browser tidak mendukung pembuatan ID sesi aman.");
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function PhotoPreviewScreen() {
  const {
    capturedPhotos, clearPhotos, resetPhotoSession,
    selectedFrameId, frames,
    brightness, contrast, saturation,
    setCurrentStep, resetEdits, resetSession,
  } = useAppStore();

  const { token } = useAuthStore();
  const { showToast } = useUIStore();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isCompositing, setIsCompositing] = useState(false);
  const isCompositingRef = useRef(false);
  const [finalCompositeUrl, setFinalCompositeUrl] = useState<string | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<{
    key: string;
    id: string;
    guestAccessToken?: string;
  } | null>(null);
  const uploadKeysRef = useRef(new Map<string, string>());

  const currentFrame = frames.find((f) => f.id === selectedFrameId) || null;
  const previewFrameUrl = currentFrame ? getFramePreviewUrl(currentFrame) : "";
  const frameMeta = getFrameMetaFromFrame(currentFrame);
  const outputKey = `${selectedFrameId || "none"}:${brightness}:${contrast}:${saturation}:${capturedPhotos.length}`;

  const handleRetake = () => {
    setUploadedPhoto(null);
    uploadKeysRef.current.clear();
    setFinalCompositeUrl(null);
    clearPhotos();
    resetEdits();
    setCurrentStep("camera");
  };

  const handleExportClick = async () => {
    if (isCompositingRef.current) return;
    isCompositingRef.current = true;
    setIsCompositing(true);
    try {
      const dataUrl = await compositeToDataUrl(
        capturedPhotos, currentFrame, brightness, contrast, saturation, 'png'
      );
      setFinalCompositeUrl(dataUrl);
      setIsExportOpen(true);
    } catch (err) {
      console.error("Composite error:", err);
      showToast("Gagal memproses foto", "error");
    } finally {
      isCompositingRef.current = false;
      setIsCompositing(false);
    }
  };

  const handleChangeFrame = () => {
    setUploadedPhoto(null);
    uploadKeysRef.current.clear();
    setFinalCompositeUrl(null);
    clearPhotos();
    resetPhotoSession();
    resetEdits();
    setCurrentStep("frame-selection");
  };

  const handlePrintClick = async () => {
    if (isCompositingRef.current) return;
    isCompositingRef.current = true;
    setIsCompositing(true);
    try {
      const dataUrl = await compositeToDataUrl(
        capturedPhotos, currentFrame, brightness, contrast, saturation, "jpg"
      );
      setFinalCompositeUrl(dataUrl);
      setIsPrintOpen(true);
    } catch (err) {
      console.error("Print composite error:", err);
      showToast("Gagal menyiapkan foto untuk dicetak", "error");
    } finally {
      isCompositingRef.current = false;
      setIsCompositing(false);
    }
  };

  const handleDownloadLocal = async (format: "png" | "jpg"): Promise<void> => {
    if (capturedPhotos.length === 0) return;

    await compositeAndDownload(
      capturedPhotos, currentFrame, brightness, contrast, saturation, format
    );
  };

  const ensurePhotoUploaded = async () => {
    if (capturedPhotos.length === 0) return undefined;

    if (uploadedPhoto?.key === outputKey) return uploadedPhoto;

    const dataUrl = await compositeToDataUrl(
      capturedPhotos, currentFrame, brightness, contrast, saturation, "jpg"
    );

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const photoResponse = await fetch(`${API_URL}/api/photos`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        frameId: currentFrame?.id || null,
        compositeImageBase64: dataUrl,
      }),
    });
    const photoData = await photoResponse.json();
    if (!photoResponse.ok || !photoData.success || !photoData.data?.id) {
      if (photoResponse.status === 413) {
        throw new Error("Ukuran foto terlalu besar untuk disimpan online.");
      }
      const requestId = photoData.requestId ? ` (kode: ${photoData.requestId})` : "";
      throw new Error(`${photoData.message || "Gagal menyimpan foto di cloud."}${requestId}`);
    }

    const result = {
      key: outputKey,
      id: photoData.data.id as string,
      guestAccessToken: photoData.data.guestAccessToken as string | undefined,
    };
    setUploadedPhoto(result);
    return result;
  };

  const handleCreateShareLink = async (): Promise<string | undefined> => {
    const photo = await ensurePhotoUploaded();
    if (!photo) return undefined;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    let idempotencyKey = uploadKeysRef.current.get(outputKey);
    if (!idempotencyKey) {
      idempotencyKey = createIdempotencyKey();
      uploadKeysRef.current.set(outputKey, idempotencyKey);
    }
    headers["Idempotency-Key"] = idempotencyKey;

    const shareBody: { photoId: string; accessToken?: string } = {
      photoId: photo.id,
    };
    if (photo.guestAccessToken) shareBody.accessToken = photo.guestAccessToken;

    const shareResponse = await fetch(`${API_URL}/api/share`, {
      method: "POST",
      headers,
      body: JSON.stringify(shareBody),
    });
    const shareData = await shareResponse.json();
    if (!shareResponse.ok || !shareData.success || !shareData.data?.token) {
      const requestId = shareData.requestId ? ` (kode: ${shareData.requestId})` : "";
      throw new Error(`${shareData.message || "Gagal membuat tautan."}${requestId}`);
    }

    return shareData.data.token;
  };

  const handleNewSession = () => {
    setIsExportOpen(false);
    setIsPrintOpen(false);
    setFinalCompositeUrl(null);
    setUploadedPhoto(null);
    uploadKeysRef.current.clear();
    resetSession();
  };

  // If no photos yet, show an error state
  if (capturedPhotos.length === 0) {
    return (
      <main className="flex-grow flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant">photo_camera</span>
        <p className="font-body-md text-body-md text-on-surface-variant">Belum ada foto diambil.</p>
        <button
          onClick={() => setCurrentStep("camera")}
          className="px-6 py-3 bg-curtain-red text-paper-white font-interactive-btn text-interactive-btn border-2 border-ink-black sketch-border hard-shadow"
        >
          Kembali ke Kamera
        </button>
      </main>
    );
  }

  // CSS Filter string based on the slider state
  const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

  return (
    <main className="flex-grow flex flex-col md:flex-row relative z-10 w-full max-w-[1600px] mx-auto p-4 md:p-gutter gap-6 md:gap-gutter pb-[100px] md:pb-gutter pt-6">

      {/* ── Left: Composite Preview ──────────────────────────── */}
      <section className="w-full md:w-8/12 flex flex-col items-center">

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-6 self-start w-full">
          <span className="bg-curtain-red text-paper-white font-label-caps text-label-caps px-3 py-1 sketch-border hard-shadow text-xs">
            LANGKAH 3 / 3
          </span>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black italic">
            Review & Simpan
          </h1>
        </div>

        {/* Multi-photo strip indicator */}
        {capturedPhotos.length > 1 && (
          <div className="self-start mb-3 flex items-center gap-2 px-3 py-1 bg-surface-container sketch-border-thin">
            <span className="material-symbols-outlined text-sm text-curtain-red" style={{ fontVariationSettings: "'FILL' 1" }}>photo_library</span>
            <span className="font-label-caps text-label-caps text-ink-black text-xs">
              {capturedPhotos.length} foto diambil • Frame: {currentFrame?.name || "Tanpa Frame"}
            </span>
          </div>
        )}

        {/* ── DOM Based Preview ──────────────────────── */}
        <div className="relative w-full max-w-2xl bg-paper-white sketch-border hard-shadow-lg p-3 pb-12 md:p-5 md:pb-16">
          {/* Tape corners */}
          <div className="absolute top-0 left-4 w-12 h-6 bg-yellow-200/80 z-20 rotate-1" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }} />
          <div className="absolute bottom-0 right-4 w-12 h-6 bg-yellow-200/80 z-20 -rotate-2" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }} />

          {/* Photo area */}
          <div className="relative w-full overflow-hidden bg-white flex items-center justify-center">
            
            {/* The Frame Image dictates the container's aspect ratio! */}
            {previewFrameUrl ? (
              <img
                src={previewFrameUrl}
                alt="Frame Overlay"
                decoding="async"
                className="relative w-full h-auto object-contain pointer-events-none z-10 block"
              />
            ) : (
               <div className="w-full" style={{ paddingBottom: '75%' }} />
            )}

            {/* 1. Draw raw photos strictly placed according to frameMeta slots (Layer 1) */}
            <div className="absolute inset-0 z-0">
              {frameMeta && frameMeta.slots.length > 0 ? (
                frameMeta.slots.map((slot, i) => (
                  <div
                    key={i}
                    className="absolute overflow-hidden"
                    style={{
                      left: `${slot.x * 100}%`,
                      top: `${slot.y * 100}%`,
                      width: `${slot.width * 100}%`,
                      height: `${slot.height * 100}%`,
                      zIndex: slot.zIndex ?? 0,
                    }}
                  >
                    <img
                      src={capturedPhotos[Math.min(i, capturedPhotos.length - 1)]}
                      alt={`Foto ${i + 1}`}
                      decoding="async"
                      className="w-full h-full object-cover origin-center"
                      style={{
                        filter: filterStyle,
                        transform: slot.rotation ? `rotate(${slot.rotation}deg)` : undefined,
                      }}
                    />
                  </div>
                ))
              ) : (
                /* Fallback if no frameMeta slots exist */
                <div className={`absolute inset-0 flex ${capturedPhotos.length > 1 ? 'flex-col' : ''} gap-0`}>
                  {capturedPhotos.map((photo, i) => (
                    <div key={i} className="flex-1 overflow-hidden">
                      <img
                        src={photo}
                        alt={`Foto ${i + 1}`}
                        decoding="async"
                        className="w-full h-full object-cover"
                        style={{ filter: filterStyle }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">filter_frames</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant text-xs">
              {currentFrame?.name || "Tanpa Frame"}{currentFrame ? ` · ${currentFrame.category}` : ""}
            </span>
            <span className="ml-auto font-label-caps text-[10px] text-on-surface-variant italic">
              {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-3 w-full max-w-2xl relative">
          <button
            onClick={handleRetake}
            className="flex-1 md:flex-none min-w-[130px] px-5 py-4 bg-paper-white text-ink-black
              font-interactive-btn text-interactive-btn border-2 border-ink-black sketch-border hard-shadow
              hover:bg-surface-container-low active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">replay</span>
            Foto Ulang
          </button>

          <button
            onClick={handleChangeFrame}
            className="flex-1 md:flex-none min-w-[130px] px-5 py-4 bg-paper-white text-ink-black
              font-interactive-btn text-interactive-btn border-2 border-ink-black sketch-border hard-shadow
              hover:bg-surface-container-low active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">filter_frames</span>
            Ganti Frame
          </button>

          <button
            onClick={handlePrintClick}
            disabled={isCompositing}
            className="flex-1 md:flex-none min-w-[180px] px-6 py-4 bg-curtain-red text-paper-white
              font-interactive-btn text-interactive-btn border-2 border-ink-black sketch-border hard-shadow
              hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center gap-2
              disabled:opacity-50 disabled:cursor-wait"
          >
            {isCompositing ? (
              <div className="w-5 h-5 border-2 border-paper-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>print</span>
            )}
            {isCompositing ? "Memproses..." : "Cetak Foto"}
          </button>

          <button
            onClick={handleExportClick}
            disabled={isCompositing}
            className="flex-1 md:flex-none min-w-[180px] px-6 py-4 bg-blueprint-blue text-paper-white
              font-interactive-btn text-interactive-btn border-2 border-ink-black sketch-border hard-shadow
              hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center gap-2
              disabled:opacity-50 disabled:cursor-wait"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
            QR / Download
          </button>

          <button
            onClick={handleNewSession}
            className="flex-1 md:flex-none min-w-[130px] px-5 py-4 bg-paper-white text-ink-black
              font-interactive-btn text-interactive-btn border-2 border-ink-black sketch-border hard-shadow
              hover:bg-surface-container-low active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">restart_alt</span>
            Sesi Baru
          </button>
        </div>
      </section>

      {/* ── Right: Quick Switch + Edit ─────────────────── */}
      <section className="w-full md:w-4/12 flex flex-col gap-4 mt-2 md:mt-0">
        <div className="bg-surface-container-lowest sketch-border hard-shadow p-4 md:p-6">
          <div className="flex items-center justify-between border-b-2 border-ink-black pb-2 mb-4">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black">Quick Switch</h2>
            <span className="material-symbols-outlined text-curtain-red" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-4 text-sm">
            Coba frame lain tanpa foto ulang.
          </p>
          <FrameSelector />
        </div>

        <div className="bg-surface-container-lowest sketch-border hard-shadow p-4 md:p-6">
          <EditPanel />
        </div>
      </section>

      {/* Export Dialog */}
      {isExportOpen && finalCompositeUrl && (
        <ExportDialog
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          compositeDataUrl={finalCompositeUrl}
          frameName={currentFrame?.name || "Tanpa Frame"}
          onDownloadLocal={handleDownloadLocal}
          onCreateShareLink={handleCreateShareLink}
        />
      )}

      {isPrintOpen && finalCompositeUrl && (
        <PrintPreviewDialog
          isOpen={isPrintOpen}
          compositeDataUrl={finalCompositeUrl}
          frameName={currentFrame?.name || "Tanpa Frame"}
          onClose={() => setIsPrintOpen(false)}
          onNewSession={handleNewSession}
        />
      )}
    </main>
  );
}
