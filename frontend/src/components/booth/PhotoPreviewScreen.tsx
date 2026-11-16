"use client";

import { useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useUIStore } from "@/store/useUIStore";
import { EditPanel } from "@/components/editor/EditPanel";
import { ExportDialog } from "@/components/export/ExportDialog";
import { PrintPreviewDialog } from "@/components/print/PrintPreviewDialog";
import { ReceiptPrinter, type ReceiptItem } from "@/components/ui/receipt-printer";
import { compositeAndDownload, compositeToDataUrl } from "@/lib/compositor";
import { getFrameMetaFromFrame, getFramePreviewUrl } from "@/lib/frameMeta";
import { useAuthStore } from "@/store/useAuthStore";
import { API_URL } from "@/lib/api";
import { BoothHeader } from "./BoothHeader";

function createIdempotencyKey(): string {
  if (typeof crypto === "undefined")
    throw new Error("Browser tidak mendukung pembuatan ID sesi aman.");
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function PhotoPreviewScreen() {
  const {
    capturedPhotos,
    selectedFrameId,
    frames,
    brightness,
    contrast,
    saturation,
    resetEdits,
    setCurrentStep,
    resetSession,
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
    setCurrentStep("review");
  };

  const handleExportClick = async () => {
    if (isCompositingRef.current) return;
    isCompositingRef.current = true;
    setIsCompositing(true);
    try {
      const dataUrl = await compositeToDataUrl(
        capturedPhotos,
        currentFrame,
        brightness,
        contrast,
        saturation,
        "png"
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
        capturedPhotos,
        currentFrame,
        brightness,
        contrast,
        saturation,
        "png"
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
      capturedPhotos,
      currentFrame,
      brightness,
      contrast,
      saturation,
      format
    );
  };

  const ensurePhotoUploaded = async () => {
    if (capturedPhotos.length === 0) return undefined;

    if (uploadedPhoto?.key === outputKey) return uploadedPhoto;

    const dataUrl = await compositeToDataUrl(
      capturedPhotos,
      currentFrame,
      brightness,
      contrast,
      saturation,
      "jpg"
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
    const photoData = photoResponse.headers
      .get("content-type")
      ?.includes("application/json")
      ? await photoResponse.json().catch(() => ({}))
      : {};
    if (!photoResponse.ok || !photoData.success || !photoData.data?.id) {
      if (photoResponse.status === 413) {
        throw new Error("Ukuran foto terlalu besar untuk disimpan online.");
      }
      const requestId = photoData.requestId
        ? ` (kode: ${photoData.requestId})`
        : "";
      throw new Error(
        `${
          photoData.message ||
          `Gagal menyimpan foto (status ${photoResponse.status}).`
        }${requestId}`
      );
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
    const shareData = shareResponse.headers
      .get("content-type")
      ?.includes("application/json")
      ? await shareResponse.json().catch(() => ({}))
      : {};
    if (!shareResponse.ok || !shareData.success || !shareData.data?.token) {
      const requestId = shareData.requestId
        ? ` (kode: ${shareData.requestId})`
        : "";
      throw new Error(
        `${
          shareData.message ||
          `Gagal membuat tautan (status ${shareResponse.status}).`
        }${requestId}`
      );
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

  if (capturedPhotos.length === 0) {
    return (
      <main className="flex-grow flex flex-col items-center justify-center gap-4 bg-studio-pattern w-full min-h-screen p-8 text-center">
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#CCFF00] text-black flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">
              photo_camera
            </span>
          </div>
          <h2 className="mt-4 text-xl font-black uppercase text-black">
            Belum Ada Foto Diambil
          </h2>
          <p className="mt-1.5 text-sm font-medium text-black/60">
            Silakan kembali ke kamera untuk mengambil foto terlebih dahulu.
          </p>
          <button
            type="button"
            onClick={() => setCurrentStep("camera")}
            className="mt-6 min-h-[48px] px-7 py-3 rounded-full bg-[#0038FF] hover:bg-[#002db3] text-white font-black text-xs uppercase shadow-lg transition-all cursor-pointer"
          >
            Kembali ke Kamera
          </button>
        </div>
      </main>
    );
  }

  const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

  const receiptItems: ReceiptItem[] = capturedPhotos.map((_, idx) => ({
    name: `POSE FOTO #${idx + 1}`,
    qty: 1,
    price: 1,
  }));

  const autoPrintKey = `${selectedFrameId || "none"}:${capturedPhotos.join("|").length}`;

  const renderFramedPhoto = () => (
    <div className="relative w-fit max-w-full mx-auto flex items-center justify-center overflow-hidden">
      {previewFrameUrl ? (
        <img
          src={previewFrameUrl}
          alt=""
          decoding="async"
          className="relative block w-auto h-auto max-w-full max-h-[calc(var(--u)*380)] object-contain opacity-0 pointer-events-none"
          aria-hidden="true"
        />
      ) : (
        <div className="w-[calc(var(--u)*260)] max-w-full aspect-[4/3]" />
      )}

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
                className="w-full h-full object-cover origin-center"
                style={{
                  filter: filterStyle,
                  transform: slot.rotation
                    ? `rotate(${slot.rotation}deg)`
                    : undefined,
                }}
              />
            </div>
          ))
        ) : (
          <div
            className={`absolute inset-0 flex ${
              capturedPhotos.length > 1 ? "flex-col" : ""
            } gap-0`}
          >
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

      {previewFrameUrl && (
        <img
          src={previewFrameUrl}
          alt="Frame Overlay"
          decoding="async"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none z-10 block [image-rendering:auto]"
        />
      )}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-studio-pattern relative overflow-x-hidden">
      <BoothHeader
        currentStep={4}
        rightSlot={
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#CCFF00] text-black text-xs font-black uppercase shadow-sm">
            <span className="w-2 h-2 rounded-full bg-black" />
            Siap Dicetak
          </span>
        }
      />

      <main className="w-full max-w-[1380px] mx-auto flex-1 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        <div className="mb-2.5 sm:mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Foto kamu sudah siap!
            </h1>
            <p className="mt-0.5 text-xs sm:text-[13px] text-white/80">
              Sesuaikan warna, lalu cetak atau simpan momenmu.
            </p>
          </div>
        </div>
        <div className="grid w-full grid-cols-1 md:grid-cols-[256px_minmax(0,1fr)] xl:grid-cols-[236px_minmax(0,1fr)_248px] items-start gap-6 xl:gap-6">
          <aside aria-label="Pengaturan dan aksi foto" className="min-w-0 order-2 md:order-1 rounded-2xl bg-white p-4 shadow-md xl:contents">
            {/* Edit controls: shared left card on tablet/mobile, dedicated left column on desktop */}
            <section aria-labelledby="edit-photo-title" className="min-w-0 xl:order-1 xl:col-start-1 xl:row-start-1 xl:rounded-2xl xl:bg-white xl:p-4 xl:shadow-md">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0038FF] text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[17px]">tune</span>
                </div>
                <div>
                  <h2 id="edit-photo-title" className="text-[15px] font-black text-slate-900 leading-tight">
                    Edit Foto
                  </h2>
                </div>
                </div>
                <button type="button" onClick={resetEdits} disabled={brightness === 100 && contrast === 100 && saturation === 100}
                  className="min-h-11 rounded-xl px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer">
                  <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                  Reset
                </button>
              </div>
              <EditPanel />
            </section>

            {/* Photo actions: shared left card on tablet/mobile, dedicated right column on desktop */}
            <section aria-labelledby="photo-actions-title" className="min-w-0 mt-3.5 border-t border-slate-100 pt-3.5 flex flex-col gap-2 xl:order-3 xl:col-start-3 xl:row-start-1 xl:mt-0 xl:border-t-0 xl:rounded-2xl xl:bg-white xl:p-4 xl:shadow-md">
              <div className="flex items-center gap-2 xl:border-b xl:border-slate-100 xl:pb-2.5 xl:mb-1">
                <div className="hidden xl:flex w-8 h-8 rounded-lg bg-[#CCFF00] text-slate-900 items-center justify-center shrink-0">
                  <span
                    className="material-symbols-outlined text-[17px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                </div>
                <h2 id="photo-actions-title" className="text-xs font-bold text-slate-500 xl:text-[15px] xl:font-black xl:text-slate-900">
                  Cetak &amp; bagikan
                </h2>
              </div>

              {/* Primary Action: Cetak Foto */}
              <button
                type="button"
                onClick={handlePrintClick}
                disabled={isCompositing}
                className="w-full min-h-12 h-12 px-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-slate-950 border border-black/10 font-bold text-sm shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isCompositing ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span
                    className="material-symbols-outlined text-[19px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    print
                  </span>
                )}
                <span>{isCompositing ? "Memproses..." : "Cetak Foto"}</span>
              </button>

              {/* Secondary Primary Action: Bagikan / Unduh QR */}
              <button
                type="button"
                onClick={handleExportClick}
                disabled={isCompositing}
                className="w-full min-h-[44px] h-11 px-3.5 rounded-xl bg-[#0038FF] hover:bg-[#002db3] text-white font-bold text-[13px] shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  qr_code_2
                </span>
                <span>Bagikan / Unduh QR</span>
              </button>

              {/* Lighter Secondary Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2.5 mt-0.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleRetake}
                  aria-label="Retake per Kolom"
                  className="min-h-11 py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#0038FF]">
                    undo
                  </span>
                  Retake
                </button>
                <button
                  type="button"
                  onClick={handleNewSession}
                  className="min-h-11 py-2 px-2 rounded-xl bg-transparent hover:bg-red-50 border border-slate-200 hover:border-red-200 text-red-600 font-semibold text-[11px] flex items-center justify-center gap-1 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    power_settings_new
                  </span>
                  Akhiri Sesi
                </button>
              </div>
            </section>
          </aside>

          {/* The printer occupies the center/right area */}
          <section aria-labelledby="photo-result-title" className="min-w-0 order-1 md:order-2 xl:order-2 xl:col-start-2 xl:row-start-1 md:sticky md:top-24 xl:static flex flex-col items-center justify-start">
            <h2 id="photo-result-title" className="sr-only">
              Pratinjau Printer Hasil Foto
            </h2>

            <ReceiptPrinter
              embedded={true}
              transparent={true}
              autoPrint={true}
              photoOnly={true}
              autoPrintKey={autoPrintKey}
              store="POINTER PHOTOBOOTH"
              address={`FRAME: ${(currentFrame?.name || "SYS_FRAME").toUpperCase()}`}
              items={receiptItems}
              showPricing={false}
              itemValueFormatter={() => "CAPTURED ✓"}
              makerMark="pointer"
              photoContent={
                <div className="max-h-[calc(var(--u)*380)] mx-auto flex justify-center">
                  {renderFramedPhoto()}
                </div>
              }
            />
          </section>

        </div>
      </main>

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
