"use client";

import { useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useUIStore } from "@/store/useUIStore";
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
    capturedPhotos, clearPhotos,
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
  const photoUploadKeysRef = useRef(new Map<string, string>());

  const currentFrame = frames.find((f) => f.id === selectedFrameId) || null;
  const previewFrameUrl = currentFrame ? getFramePreviewUrl(currentFrame) : "";
  const frameMeta = getFrameMetaFromFrame(currentFrame);
  const outputKey = `${selectedFrameId || "none"}:${brightness}:${contrast}:${saturation}:${capturedPhotos.length}`;

  const handleRetake = () => {
    setUploadedPhoto(null);
    uploadKeysRef.current.clear();
    photoUploadKeysRef.current.clear();
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
    let photoIdempotencyKey = photoUploadKeysRef.current.get(outputKey);
    if (!photoIdempotencyKey) {
      photoIdempotencyKey = createIdempotencyKey();
      photoUploadKeysRef.current.set(outputKey, photoIdempotencyKey);
    }
    headers["Idempotency-Key"] = photoIdempotencyKey;

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
    photoUploadKeysRef.current.clear();
    resetSession();
  };

  // If no photos yet, show an error state
  if (capturedPhotos.length === 0) {
    return (
      <main className="flex-grow flex flex-col items-center justify-center gap-4 bg-cyber-purple w-full h-full p-8 text-center">
        <span className="material-symbols-outlined text-5xl text-error-red">photo_camera</span>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-stark-white uppercase">
          SYS_ERR: NO_PHOTOS
        </h2>
        <button
          onClick={() => setCurrentStep("camera")}
          className="mt-4 px-6 py-3 bg-neon-yellow text-ink-black font-tech-mono font-bold border-border-thick border-ink-black hard-shadow jiggle-active"
        >
          RETURN TO CAMERA
        </button>
      </main>
    );
  }

  // CSS Filter string based on the slider state
  const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-cyber-purple relative overflow-x-hidden">
      
      {/* TopAppBar inside the view */}
      <header className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 w-full z-50 bg-background border-b-border-thick border-ink-black sticky top-0">
        <div className="flex items-center gap-4">
          <h1 className="font-headline-md text-headline-md text-primary tracking-tighter">POINTER PHOTOBOOTH</h1>
          <div className="hidden md:flex h-6 border-l-2 border-outline-variant mx-2"></div>
          <span className="hidden md:block font-tech-mono text-tech-mono uppercase text-neon-yellow font-bold">LANGKAH 3 • HASIL FOTO</span>
        </div>
        <div className="flex items-center gap-4 text-neon-yellow">
          <span className="material-symbols-outlined text-[24px]">wifi_tethering</span>
          <span className="material-symbols-outlined text-[24px]">timer</span>
        </div>
      </header>

      {/* Mobile Step Indicator */}
      <div className="md:hidden bg-ink-black p-2 border-b-border-thick border-ink-black flex justify-center z-40 relative">
        <span className="font-tech-mono text-tech-mono uppercase text-neon-yellow font-bold">LANGKAH 3 • HASIL FOTO</span>
      </div>

      <main className="flex-grow p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center relative pb-8">
        {/* Background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: "radial-gradient(#6320ee 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
        
        {/* 3-Column Layout: Left (Edit Foto), Center (Hasil Foto), Right (Pilih Aksi) */}
        <div className="w-full max-w-[1440px] flex flex-col lg:flex-row items-center lg:items-center justify-center gap-6 relative z-10">

          {/* LEFT: EDIT FOTO */}
          <div className="w-full max-w-md lg:max-w-none lg:w-72 xl:w-80 flex-shrink-0 order-2 lg:order-1 bg-surface-container-highest border-border-thick border-ink-black hard-shadow p-5 md:p-6 pixel-corners">
            <div className="pixel-corners-inner"></div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black uppercase tracking-tighter mb-4 flex items-center gap-2 border-b-2 border-ink-black pb-2">
              <span className="material-symbols-outlined text-cyber-purple">tune</span>
              EDIT FOTO
            </h2>
            <EditPanel />
          </div>

          {/* CENTER: Window Module for Photo */}
          <div className="w-full max-w-md lg:max-w-none lg:w-auto flex-shrink order-1 lg:order-2 bg-stark-white border-border-thick border-ink-black hard-shadow-lg flex flex-col relative pixel-corners">
            <div className="pixel-corners-inner"></div>
            
            {/* OS Window Header */}
            <div className="h-8 bg-ink-black flex items-center justify-start px-4 gap-2 border-b-border-thick border-ink-black">
              <div className="w-3 h-3 bg-stark-white"></div>
              <div className="w-3 h-3 bg-neon-yellow"></div>
              <div className="w-3 h-3 bg-error-red"></div>
              <span className="ml-2 text-stark-white font-tech-mono text-xs uppercase tracking-widest">HASIL FOTO</span>
            </div>

            <div className="p-4 md:p-6 flex flex-col items-center">
              
              {/* The frame asset defines the preview ratio so every frame stays fully visible. */}
              <div className="relative w-fit max-w-full bg-ink-black border-border-thick border-ink-black p-2 flex items-center justify-center">
                
                {/* Pixel art corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-neon-yellow -translate-x-2 -translate-y-2 z-30"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-neon-yellow translate-x-2 translate-y-2 z-30"></div>

                {/* Invisible image keeps all slot coordinates aligned to the real frame. */}
                {previewFrameUrl ? (
                    <img
                      src={previewFrameUrl}
                      alt=""
                      decoding="async"
                      className="relative block w-auto h-auto max-w-full max-h-[min(65vh,680px)] object-contain opacity-0 pointer-events-none"
                      aria-hidden="true"
                    />
                  ) : (
                    <div className="w-[min(92vw,500px)] aspect-[4/3]" />
                  )}

                {/* Draw raw photos strictly within the frame slots. */}
                <div className="absolute inset-0 z-0 overflow-hidden">
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
                          className="w-full h-full object-cover origin-center filter drop-shadow-md"
                          style={{
                            filter: filterStyle,
                            transform: slot.rotation ? `rotate(${slot.rotation}deg)` : undefined,
                          }}
                        />
                      </div>
                    ))
                  ) : (
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

                {/* Frame stays above the captured photos and uses the exact same bounds. */}
                {previewFrameUrl && (
                    <img
                      src={previewFrameUrl}
                      alt="Frame Overlay"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-fill pointer-events-none z-10 block"
                    />
                  )}
              </div>

              {/* Metadata */}
              <div className="mt-4 flex items-center justify-between w-full border-t-border-thick border-ink-black pt-3">
                <div className="flex flex-col">
                  <span className="font-tech-mono text-ink-black font-bold text-sm uppercase">
                    {currentFrame?.name || "SYS_FRAME"}
                  </span>
                  <span className="font-label-caps text-on-surface-variant text-[10px] uppercase">
                    {capturedPhotos.length} FOTO
                  </span>
                </div>
                <span className="font-tech-mono text-[10px] text-ink-black bg-neon-yellow px-2 py-1 border border-ink-black">
                  READY
                </span>
              </div>

            </div>
          </div>

          {/* RIGHT: PILIH AKSI */}
          <div className="w-full max-w-md lg:max-w-none lg:w-72 xl:w-80 flex-shrink-0 order-3 lg:order-3 bg-stark-white border-border-thick border-ink-black hard-shadow p-5 md:p-6 pixel-corners flex flex-col gap-4">
            <div className="pixel-corners-inner"></div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black uppercase tracking-tighter mb-2">
              PILIH AKSI
            </h2>
            
            <button
              onClick={handlePrintClick}
              disabled={isCompositing}
              className="w-full py-4 bg-neon-yellow text-ink-black border-border-thick border-ink-black font-label-caps text-label-caps hard-shadow jiggle-active flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCompositing ? (
                <div className="w-5 h-5 border-2 border-ink-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>print</span>
              )}
              {isCompositing ? "MEMPROSES..." : "CETAK FOTO"}
            </button>
            
            <button
              onClick={handleExportClick}
              disabled={isCompositing}
              className="w-full py-4 bg-stark-white text-ink-black border-border-thick border-ink-black font-label-caps text-label-caps hard-shadow jiggle-active flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
              BAGIKAN / UNDUH
            </button>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={handleRetake}
                className="py-3 px-2 bg-cyber-purple text-stark-white border-border-thick border-ink-black font-label-caps text-label-caps hard-shadow-sm jiggle-active flex items-center justify-center gap-1 text-[10px] whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-sm">undo</span>
                AMBIL ULANG
              </button>
              <button
                onClick={handleNewSession}
                className="py-3 px-2 bg-error-red text-stark-white border-border-thick border-ink-black font-label-caps text-label-caps hard-shadow-sm jiggle-active flex items-center justify-center gap-1 text-[10px] whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-sm">power_settings_new</span>
                AKHIRI SESI
              </button>
            </div>
            
          </div>

        </div>

      </main>

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
    </div>
  );
}
