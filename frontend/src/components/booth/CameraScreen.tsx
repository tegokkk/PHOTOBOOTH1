"use client";

import { useEffect, useRef, useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import { useAppStore } from "@/store/useAppStore";
import { useUIStore } from "@/store/useUIStore";
import { getFrameMeta, getFramePreviewUrl } from "@/lib/frameMeta";
import { CameraOverlays } from "./camera/CameraOverlays";
import { CameraControls } from "./camera/CameraControls";

export function CameraScreen() {
  const { 
    videoRef, hasPermission, requestPermission, capturePhoto, error, stopCamera,
    hasMultipleCameras, switchCamera, facingMode
  } = useCamera();
  const {
    capturedPhotos, addCapturedPhoto, clearPhotos, setCurrentStep,
    selectedFrameId, frames,
    currentPhotoIndex, totalPhotosNeeded, setPhotoSession, advancePhotoIndex, setPhotoIndex, resetPhotoSession,
  } = useAppStore();
  const { showToast } = useUIStore();

  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const currentFrame = frames.find((f) => f.id === selectedFrameId) || null;
  const previewFrameUrl = currentFrame ? getFramePreviewUrl(currentFrame) : "";
  const frameMeta = previewFrameUrl ? getFrameMeta(previewFrameUrl) : null;
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

  /** 3-2-1 countdown then capture */
  const startCountdown = () => {
    if (isCapturing || countdown !== null) return;
    setIsCapturing(true);
    let n = 3;
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

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return (
    <main className="flex-grow flex flex-col items-center justify-start relative z-10 w-full max-w-[1600px] mx-auto p-4 md:p-gutter pb-[100px] md:pb-gutter pt-6">

      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-4 self-start w-full flex-wrap">
        <span className="bg-curtain-red text-paper-white font-label-caps text-label-caps px-3 py-1 sketch-border hard-shadow text-xs shrink-0">
          LANGKAH 2 / 3
        </span>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black italic">
          Ambil Foto
        </h1>
        <button
          onClick={() => {
            if (capturedPhotos.filter(Boolean).length > 0) {
              if (!window.confirm("Yakin ingin ganti frame? Foto yang sudah diambil akan hilang jika frame baru membutuhkan jumlah slot yang berbeda.")) {
                return;
              }
            }
            if (countdownRef.current) clearInterval(countdownRef.current);
            stopCamera();
            setCurrentStep("frame-selection");
          }}
          className="ml-auto flex items-center gap-1 font-label-caps text-label-caps text-on-surface-variant hover:text-curtain-red transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Ganti Frame
        </button>
      </div>

      {/* Switch Camera Button (if multiple cameras exist) */}
      {hasMultipleCameras && hasPermission && (
        <div className="self-end mb-2 mr-2 z-20 md:relative md:mb-3">
          <button
            onClick={() => switchCamera()}
            className="flex items-center gap-2 px-3 py-2 bg-surface-container-high border-2 border-ink-black sketch-border-thin hard-shadow hover:bg-surface-container-highest active:translate-y-px transition-all"
          >
            <span className="material-symbols-outlined text-sm">cameraswitch</span>
            <span className="font-label-caps text-xs hidden sm:inline">Tukar Kamera</span>
          </button>
        </div>
      )}

      {/* Multi-shot progress */}
      {photoCount > 1 && (
        <div className="self-start mb-3 flex items-center gap-3">
          <span className="font-label-caps text-label-caps text-ink-black text-sm">
            Foto {Math.min(currentPhotoIndex + 1, photoCount)} dari {photoCount}:
          </span>
          <div className="flex gap-2">
            {Array.from({ length: photoCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPhotoIndex(i)}
                className={`w-8 h-8 border-2 border-ink-black flex items-center justify-center transition-all cursor-pointer ${
                  i === currentPhotoIndex
                    ? "bg-ink-black text-paper-white animate-pulse"
                    : capturedPhotos[i]
                      ? "bg-curtain-red text-paper-white"
                      : "bg-paper-white text-on-surface-variant hover:bg-gray-100"
                }`}
                title={capturedPhotos[i] ? "Klik untuk foto ulang slot ini" : "Slot foto"}
              >
                {capturedPhotos[i] && i !== currentPhotoIndex ? (
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                ) : (
                  <span className="font-label-caps text-[11px]">{i + 1}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Frame badge */}
      {currentFrame && (
        <div className="self-start mb-3 flex items-center gap-2 px-3 py-1 bg-surface-container sketch-border-thin">
          <span className="material-symbols-outlined text-sm text-curtain-red" style={{ fontVariationSettings: "'FILL' 1" }}>
            filter_frames
          </span>
          <span className="font-label-caps text-label-caps text-ink-black text-xs">{currentFrame.name}</span>
        </div>
      )}

      {/* Camera Box */}
      <div className="relative w-full max-w-2xl bg-surface-container sketch-border hard-shadow-lg flex items-center justify-center overflow-hidden mb-6">
        
        {/* Aspect ratio placeholder (invisible frame image) */}
        {previewFrameUrl ? (
          <img 
            src={previewFrameUrl}
            alt="aspect-ratio-placeholder" 
            className="relative w-full h-auto opacity-0 pointer-events-none" 
            aria-hidden="true" 
          />
        ) : (
          <div className="w-full" style={{ paddingBottom: photoCount > 1 ? '133.33%' : '75%' }} />
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
                height: `${slot.height * 100}%`,
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
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
          className={`absolute object-cover transition-all duration-300 z-10 ${facingMode === 'user' ? 'transform scale-x-[-1]' : ''}`}
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
            className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none" 
          />
        )}

        {/* Overlays (countdown, flash, slot indicators) */}
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

      {/* Capture Controls */}
      <CameraControls
        hasPermission={hasPermission}
        photoCount={photoCount}
        currentPhotoIndex={currentPhotoIndex}
        countdown={countdown}
        onSnap={handleSnap}
      />
      
      {photoCount > 1 && currentPhotoIndex > 0 && currentPhotoIndex < totalPhotosNeeded && (
        <div className="mt-4 flex justify-center w-full max-w-2xl">
          <button
            onClick={() => {
              clearPhotos();
              resetPhotoSession();
              showToast("Diulang dari awal.", "info");
            }}
            className="font-label-caps text-label-caps text-on-surface-variant hover:text-curtain-red transition-colors text-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">replay</span>
            Ulangi dari Slot 1
          </button>
        </div>
      )}
    </main>
  );
}
