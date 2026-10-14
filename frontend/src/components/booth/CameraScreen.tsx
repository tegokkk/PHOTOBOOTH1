"use client";

import { useEffect, useRef, useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import { useAppStore } from "@/store/useAppStore";
import { useUIStore } from "@/store/useUIStore";
import { getFramePreviewUrl, getFrameMetaFromFrame } from "@/lib/frameMeta";
import { CameraOverlays } from "./camera/CameraOverlays";

export function CameraScreen() {
  const { 
    videoRef, hasPermission, requestPermission, capturePhoto, error, stopCamera,
    hasMultipleCameras, switchCamera, facingMode
  } = useCamera();
  const {
    capturedPhotos, addCapturedPhoto, clearPhotos, setCurrentStep,
    selectedFrameId, frames,
    currentPhotoIndex, totalPhotosNeeded, setPhotoSession, advancePhotoIndex, resetPhotoSession,
    timerDuration, setTimerDuration,
  } = useAppStore();
  const { showToast } = useUIStore();

  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const currentFrame = frames.find((f) => f.id === selectedFrameId) || null;
  const previewFrameUrl = currentFrame ? getFramePreviewUrl(currentFrame) : "";
  const frameMeta = getFrameMetaFromFrame(currentFrame);
  const photoCount = frameMeta?.photoCount ?? 1;

  // Init photo session on mount
  useEffect(() => {
    if (currentPhotoIndex === 0 && capturedPhotos.length === 0) {
      setPhotoSession(photoCount);
    }
    if (hasPermission === null) {
      requestPermission();
    }
  }, [photoCount, hasPermission, currentPhotoIndex, capturedPhotos.length, requestPermission, setPhotoSession]);

  /** Flash animation */
  const triggerFlash = () => {
    setFlashVisible(true);
    setTimeout(() => setFlashVisible(false), 300);
  };

  /** Do the actual capture → store photo → decide next step */
  const doCapture = () => {
    const photo = capturePhoto();
    if (!photo) {
      showToast("Gagal mengambil foto. Coba lagi.", "error");
      return;
    }

    triggerFlash();
    addCapturedPhoto(photo);

    // Give state time to update, then check if all photos are filled
    setTimeout(() => {
      const photos = useAppStore.getState().capturedPhotos;
      const filledCount = photos.filter(Boolean).length;

      if (filledCount >= totalPhotosNeeded) {
        showToast("Semua foto diambil!", "success");
        setTimeout(() => setCurrentStep("preview"), 350);
      } else {
        advancePhotoIndex();
        const nextIndex = useAppStore.getState().currentPhotoIndex;
        showToast(`Slot ${nextIndex + 1}/${totalPhotosNeeded} — ambil foto! 📸`, "info");
      }
    }, 0);
  };

  /** Countdown with user-selected duration (3s, 5s, 10s) then capture */
  const startCountdown = () => {
    if (isCapturing || countdown !== null) return;
    setIsCapturing(true);
    let n = timerDuration;
    setCountdown(n);
    countdownRef.current = setInterval(() => {
      n--;
      if (n <= 0) {
        clearInterval(countdownRef.current!);
        setCountdown(null);
        setIsCapturing(false);
        doCapture();
      } else {
        setCountdown(n);
      }
    }, 1000);
  };

  /** Trigger capture sequence (with countdown) */
  const handleSnap = () => {
    if (countdown !== null) return;
    startCountdown();
  };

  const handleChangeFrame = () => {
    if (capturedPhotos.some(Boolean) && !window.confirm("Foto yang sudah diambil akan dihapus. Yakin ingin mengganti frame?")) {
      return;
    }

    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = null;
    setCountdown(null);
    setIsCapturing(false);
    stopCamera();
    clearPhotos();
    resetPhotoSession();
    setCurrentStep("frame-selection");
  };

  const handleRetake = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = null;
    setCountdown(null);
    setIsCapturing(false);
    clearPhotos();
    resetPhotoSession();
    showToast("Sesi foto diulang dengan frame yang sama.", "info");
  };

  // Keyboard shortcut: Space or Enter to trigger shutter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        if (countdown === null && currentPhotoIndex < photoCount) {
          startCountdown();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [countdown, currentPhotoIndex, photoCount]);

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-cyber-purple relative overflow-x-hidden">
      {/* TopAppBar inside the view */}
      <header className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 w-full z-50 bg-background border-b-border-thick border-ink-black sticky top-0">
        <div className="flex items-center gap-4">
          <h1 className="font-headline-md text-headline-md text-primary tracking-tighter">POINTER PHOTOBOOTH</h1>
          <div className="hidden md:flex h-6 border-l-2 border-outline-variant mx-2"></div>
          <span className="hidden md:block font-tech-mono text-tech-mono uppercase text-neon-yellow font-bold">LANGKAH 2 • AMBIL FOTO</span>
        </div>
        <div className="flex items-center gap-4 text-neon-yellow">
          <span className="material-symbols-outlined text-[24px]">wifi_tethering</span>
          <div className="flex items-center gap-1 font-tech-mono text-xs font-bold bg-ink-black text-neon-yellow px-2.5 py-1 border border-neon-yellow hard-shadow-sm">
            <span className="material-symbols-outlined text-[16px]">timer</span>
            <span>{timerDuration}S</span>
          </div>
        </div>
      </header>

      {/* Mobile Step Indicator */}
      <div className="md:hidden bg-ink-black p-2 border-b-border-thick border-ink-black flex justify-center z-40 relative">
        <span className="font-tech-mono text-tech-mono uppercase text-neon-yellow font-bold">LANGKAH 2 • AMBIL FOTO</span>
      </div>

      <main className="flex-grow p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center relative pb-8">
        {/* Background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: "radial-gradient(#DFFF00 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>

        {/* 3-Column Layout: Left (Opsi Foto), Center (Live Viewfinder), Right (Kontrol Shutter) */}
        <div className="w-full max-w-[1440px] flex flex-col lg:flex-row items-center lg:items-center justify-center gap-6 relative z-10">

          {/* LEFT: OPSI FOTO */}
          <div className="w-full max-w-md lg:max-w-none lg:w-72 xl:w-80 flex-shrink-0 order-2 lg:order-1 bg-stark-white border-border-thick border-ink-black hard-shadow p-5 md:p-6 pixel-corners flex flex-col gap-4">
            <div className="pixel-corners-inner"></div>

            {/* Header */}
            <div className="flex items-center gap-2 border-b-2 border-ink-black pb-2">
              <span className="material-symbols-outlined text-cyber-purple font-bold">tune</span>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black uppercase tracking-tighter">
                OPSI FOTO
              </h2>
            </div>

            {/* Frame Details Badge */}
            <div className="bg-surface-container border-2 border-ink-black p-3.5 hard-shadow-sm flex flex-col gap-1">
              <span className="font-tech-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                FRAME AKTIF
              </span>
              <span className="font-tech-mono text-ink-black font-black text-sm uppercase truncate">
                {currentFrame?.name || "SYS_FRAME"}
              </span>
              <span className="font-label-caps text-xs text-cyber-purple font-bold">
                {photoCount} SLOT FOTO
              </span>
            </div>

            {/* Ganti Frame Button */}
            <button
              onClick={handleChangeFrame}
              disabled={countdown !== null}
              className="w-full py-3.5 px-4 bg-neon-yellow text-ink-black border-border-thick border-ink-black font-tech-mono font-bold text-sm uppercase hard-shadow jiggle-active hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              aria-label="Ganti Frame"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>filter_frames</span>
              <span>GANTI FRAME</span>
            </button>

            {/* Ulangi Button */}
            <button
              onClick={handleRetake}
              disabled={countdown !== null || (currentPhotoIndex === 0 && capturedPhotos.length === 0)}
              className="w-full py-3.5 px-4 bg-stark-white text-ink-black border-border-thick border-ink-black font-tech-mono font-bold text-sm uppercase hard-shadow-sm jiggle-active hover:bg-error-red hover:text-stark-white hover:border-ink-black transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              aria-label="Ulangi Foto"
            >
              <span className="material-symbols-outlined font-bold">undo</span>
              <span>ULANGI</span>
            </button>

            {/* Switch Camera Button (if multiple cameras) */}
            {hasMultipleCameras && (
              <button
                onClick={switchCamera}
                disabled={countdown !== null}
                className="w-full py-3 px-4 bg-surface-container-high text-ink-black border-2 border-ink-black font-tech-mono font-bold text-xs uppercase hard-shadow-sm jiggle-active hover:bg-neon-yellow transition-all flex items-center justify-center gap-2"
                aria-label="Tukar Kamera"
              >
                <span className="material-symbols-outlined text-[18px]">flip_camera_ios</span>
                <span>TUKAR KAMERA</span>
              </button>
            )}

            {/* Tips Card */}
            <div className="mt-auto border-t-2 border-ink-black/20 pt-3">
              <p className="font-tech-mono text-[11px] text-ink-black/70 leading-relaxed uppercase">
                ℹ Tips: Pastikan wajah berada tepat di dalam area slot frame sebelum memotret.
              </p>
            </div>
          </div>

          {/* CENTER: Window Module for Camera Viewfinder */}
          <div className="w-full max-w-md lg:max-w-none lg:w-auto flex-shrink order-1 lg:order-2 bg-stark-white border-border-thick border-ink-black hard-shadow-lg flex flex-col relative pixel-corners">
            <div className="pixel-corners-inner"></div>

            {/* OS Window Header */}
            <div className="h-8 bg-ink-black flex items-center justify-between px-4 border-b-border-thick border-ink-black">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-stark-white"></div>
                <div className="w-3 h-3 bg-neon-yellow"></div>
                <div className="w-3 h-3 bg-error-red"></div>
                <span className="ml-2 text-stark-white font-tech-mono text-xs uppercase tracking-widest">LIVE CAMERA</span>
              </div>
              <div className="flex items-center gap-2 text-neon-yellow">
                <span className="w-2 h-2 rounded-full bg-error-red animate-ping"></span>
                <span className="font-tech-mono text-[10px] uppercase font-bold tracking-wider">REC</span>
              </div>
            </div>

            <div className="p-4 md:p-6 flex flex-col items-center">
              {/* Viewfinder Frame Ratio Container */}
              <div className="relative w-fit max-w-full bg-ink-black border-border-thick border-ink-black p-2 flex items-center justify-center overflow-hidden group">
                {/* Pixel art corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-neon-yellow -translate-x-2 -translate-y-2 z-30"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-neon-yellow translate-x-2 translate-y-2 z-30"></div>

                {/* The invisible image keeps the viewfinder at the frame's natural ratio. */}
                {previewFrameUrl ? (
                  <img 
                    src={previewFrameUrl}
                    alt=""
                    className="relative block w-auto h-auto max-w-full max-h-[min(65vh,680px)] object-contain opacity-0 pointer-events-none" 
                    aria-hidden="true" 
                  />
                ) : (
                  <div className="w-[min(92vw,500px)] aspect-[4/3]" />
                )}

                {/* Previously Captured Photos */}
                {photoCount > 1 && frameMeta?.slots && frameMeta.slots.map((slot, i) => {
                  if (i >= currentPhotoIndex || !capturedPhotos[i]) return null;
                  return (
                    <img
                      key={i}
                      src={capturedPhotos[i]}
                      alt={`Slot ${i + 1}`}
                      className="absolute object-cover z-10"
                      style={{
                        left: `${slot.x * 100}%`,
                        top: `${slot.y * 100}%`,
                        width: `${slot.width * 100}%`,
                        height: `${slot.height * 100}%`
                      }}
                    />
                  );
                })}

                {/* Video stream (bounded to active slot) */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute object-cover transition-all duration-300 z-10 filter ${facingMode === 'user' ? 'transform scale-x-[-1]' : ''}`}
                  style={
                    frameMeta?.slots && frameMeta.slots[currentPhotoIndex]
                      ? {
                          left: `${frameMeta.slots[currentPhotoIndex].x * 100}%`,
                          top: `${frameMeta.slots[currentPhotoIndex].y * 100}%`,
                          width: `${frameMeta.slots[currentPhotoIndex].width * 100}%`,
                          height: `${frameMeta.slots[currentPhotoIndex].height * 100}%`,
                        }
                      : { left: 0, top: 0, width: '100%', height: '100%' }
                  }
                />

                {/* Frame Overlay (with transparent holes) */}
                {previewFrameUrl && (
                  <img 
                    src={previewFrameUrl}
                    alt="Frame Overlay" 
                    className="absolute inset-0 w-full h-full object-fill z-20 pointer-events-none [image-rendering:auto]" 
                  />
                )}

                {/* Overlays (countdown, flash, slot indicators, scanlines) */}
                <div className="absolute inset-0 z-30 pointer-events-none">
                  <CameraOverlays
                    hasPermission={hasPermission}
                    error={error}
                    onRequestPermission={() => requestPermission()}
                    countdown={countdown}
                    flashVisible={flashVisible}
                    frameMeta={frameMeta}
                    currentPhotoIndex={currentPhotoIndex}
                  />
                </div>
              </div>

              {/* Viewfinder Footer Meta */}
              <div className="mt-4 flex items-center justify-between w-full border-t-border-thick border-ink-black pt-3">
                <div className="flex flex-col">
                  <span className="font-tech-mono text-ink-black font-bold text-sm uppercase">
                    SLOT {Math.min(currentPhotoIndex + 1, photoCount)} / {photoCount}
                  </span>
                  <span className="font-label-caps text-on-surface-variant text-[10px] uppercase">
                    {photoCount - currentPhotoIndex - 1 > 0 ? `${photoCount - currentPhotoIndex - 1} FOTO LAGI` : "SLOT TERAKHIR"}
                  </span>
                </div>
                <span className="font-tech-mono text-[10px] text-ink-black bg-neon-yellow px-2 py-1 border border-ink-black font-bold">
                  {countdown !== null ? `HITUNG: ${countdown}S` : `TIMER: ${timerDuration}S`}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: KONTROL SHUTTER */}
          <div className="w-full max-w-md lg:max-w-none lg:w-72 xl:w-80 flex-shrink-0 order-3 lg:order-3 bg-stark-white border-border-thick border-ink-black hard-shadow p-5 md:p-6 pixel-corners flex flex-col items-center justify-center gap-5 text-center">
            <div className="pixel-corners-inner"></div>

            {/* Header */}
            <div className="w-full flex items-center justify-center gap-2 border-b-2 border-ink-black pb-2">
              <span className="material-symbols-outlined text-cyber-purple font-bold">photo_camera</span>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black uppercase tracking-tighter">
                AMBIL FOTO
              </h2>
            </div>

            {/* Counter Chip */}
            <div className="w-full bg-ink-black text-neon-yellow border-2 border-ink-black py-2 px-3 hard-shadow-sm">
              <span className="font-tech-mono font-bold text-sm uppercase tracking-wider">
                FOTO {Math.min(currentPhotoIndex + 1, photoCount)} DARI {photoCount}
              </span>
            </div>

            {/* Shutter Button */}
            <button
              onClick={handleSnap}
              disabled={countdown !== null || currentPhotoIndex >= photoCount}
              className="relative group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed jiggle-active transition-all my-2"
              aria-label="Ambil Foto"
            >
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-ink-black bg-stark-white hard-shadow flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-ink-black bg-neon-yellow flex items-center justify-center">
                  <div className="w-9 h-9 md:w-11 md:h-11 rounded-full border-2 border-ink-black bg-stark-white flex items-center justify-center">
                    {countdown !== null ? (
                      <span className="font-tech-mono font-black text-ink-black text-xl animate-pulse">{countdown}</span>
                    ) : (
                      <span className="material-symbols-outlined text-ink-black text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                    )}
                  </div>
                </div>
              </div>
            </button>

            {/* Action Label */}
            <div className="flex flex-col items-center gap-1">
              <span className="font-headline-md text-headline-md text-ink-black uppercase tracking-tight">
                {countdown !== null ? `MENGAMBIL... (${countdown}S)` : "TEKAN SHUTTER"}
              </span>
              <span className="font-tech-mono text-[10px] text-ink-black/70 uppercase tracking-widest bg-surface-container px-2 py-1 border border-ink-black font-bold">
                ATAU TEKAN [SPASI]
              </span>
            </div>

            {/* Timer Selector Options */}
            <div className="w-full bg-surface-container border-2 border-ink-black p-3 flex flex-col gap-2 hard-shadow-sm">
              <div className="flex items-center justify-between text-ink-black">
                <span className="font-tech-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">timer</span>
                  PILIH TIMER
                </span>
                <span className="font-tech-mono text-xs font-black text-cyber-purple bg-stark-white px-2 py-0.5 border border-ink-black">
                  {timerDuration} DETIK
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 w-full">
                {([3, 5, 10] as const).map((seconds) => {
                  const isSelected = timerDuration === seconds;
                  return (
                    <button
                      key={seconds}
                      type="button"
                      onClick={() => {
                        setTimerDuration(seconds);
                        showToast(`Timer diatur ke ${seconds} detik ⏱`, "info");
                      }}
                      disabled={countdown !== null}
                      className={`py-2 px-1 font-tech-mono font-bold text-xs border-2 border-ink-black uppercase transition-all flex items-center justify-center gap-1 disabled:opacity-50 jiggle-active ${
                        isSelected
                          ? "bg-neon-yellow text-ink-black hard-shadow-sm scale-[1.02]"
                          : "bg-stark-white text-ink-black/70 hover:bg-neon-yellow/30 hover:text-ink-black"
                      }`}
                      aria-label={`Timer ${seconds} detik`}
                    >
                      <span className="font-black text-sm">{seconds}s</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Footer */}
            <div className="w-full border-t-2 border-ink-black/20 pt-3">
              <p className="font-tech-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                TIMER AKTIF: {timerDuration} DETIK
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
