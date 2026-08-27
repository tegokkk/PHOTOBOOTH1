"use client";

import { useEffect, useRef, useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import { useAppStore } from "@/store/useAppStore";
import { useUIStore } from "@/store/useUIStore";
import { getFrameMetaFromFrame, getFramePreviewUrl } from "@/lib/frameMeta";
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
    currentPhotoIndex, totalPhotosNeeded, setPhotoSession, advancePhotoIndex, resetPhotoSession,
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

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-cyber-purple relative overflow-hidden">
      {/* TopAppBar inside the view */}
      <header className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 w-full z-50 bg-background border-b-border-thick border-ink-black sticky top-0">
        <div className="flex items-center gap-4">
          <h1 className="font-headline-md text-headline-md text-primary tracking-tighter">CYBER-BOOTH_V1.0</h1>
          <div className="hidden md:flex h-6 border-l-2 border-outline-variant mx-2"></div>
          <span className="hidden md:block font-tech-mono text-tech-mono uppercase text-neon-yellow font-bold">LANGKAH 2 • AMBIL FOTO</span>
        </div>
        <div className="flex items-center gap-4 text-neon-yellow">
          <span className="material-symbols-outlined text-[24px]">wifi_tethering</span>
          <span className="material-symbols-outlined text-[24px]">timer</span>
        </div>
      </header>

      {/* Mobile Step Indicator */}
      <div className="md:hidden bg-ink-black p-2 border-b-border-thick border-ink-black flex justify-center z-40 relative">
        <span className="font-tech-mono text-tech-mono uppercase text-neon-yellow font-bold">LANGKAH 2 • AMBIL FOTO</span>
      </div>

      <main className="flex-1 p-margin-mobile md:p-margin-desktop flex flex-col relative min-h-0 z-10 w-full max-w-[1200px] mx-auto pb-8">
        {/* Status Bar & Indicators */}
        <div className="flex justify-between items-start mb-4 z-20">
          {/* OS Style Window Bar */}
          <div className="bg-stark-white border-border-thick border-ink-black px-4 py-2 inline-flex items-center hard-shadow-sm">
            <div className="flex mr-4 gap-1">
              <span className="w-3 h-3 border-2 border-ink-black bg-stark-white"></span>
              <span className="w-3 h-3 border-2 border-ink-black bg-neon-yellow"></span>
              <span className="w-3 h-3 border-2 border-ink-black bg-error-red"></span>
            </div>
            <span className="font-tech-mono text-ink-black font-bold uppercase tracking-widest text-[12px]">LIVE CAMERA</span>
          </div>

          {/* Photos Counter Chip */}
          <div className="bg-ink-black text-neon-yellow border-border-thick border-stark-white px-6 py-3 hard-shadow-sm transform rotate-2">
            <span className="font-tech-mono font-bold text-lg">
              FOTO {Math.min(currentPhotoIndex + 1, photoCount)}/{photoCount}
            </span>
          </div>
        </div>

        {/* Camera Viewfinder Container */}
        <div className="flex-1 relative w-full flex flex-col justify-center min-h-[400px]">
          
          <div className="relative w-fit max-w-full mx-auto bg-surface-container border-border-thick border-ink-black hard-shadow flex items-center justify-center overflow-hidden group pixel-corners">
            <div className="pixel-corners-inner"></div>
            
            {/* The invisible image keeps the viewfinder at the frame's natural ratio. */}
            {previewFrameUrl ? (
              <img 
                src={previewFrameUrl}
                alt=""
                className="relative block w-auto h-auto max-w-full max-h-[min(54vh,560px)] object-contain opacity-0 pointer-events-none" 
                aria-hidden="true" 
              />
            ) : (
              <div className="w-[min(92vw,720px)] aspect-[4/3]" />
            )}

            {/* Previously Captured Photos */}
            {photoCount > 1 && frameMeta?.slots && frameMeta.slots.map((slot, i) => {
              if (i >= currentPhotoIndex || !capturedPhotos[i]) return null;
              return (
                <img
                  key={i}
                  src={capturedPhotos[i]}
                  alt={`Slot ${i + 1}`}
                  className="absolute object-contain z-10"
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
              className={`absolute object-contain transition-all duration-300 z-10 filter ${facingMode === 'user' ? 'transform scale-x-[-1]' : ''}`}
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
                className="absolute inset-0 w-full h-full object-fill z-20 pointer-events-none" 
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

          {/* Bottom Controls Cluster */}
          <CameraControls
            hasPermission={hasPermission}
            photoCount={photoCount}
            currentPhotoIndex={currentPhotoIndex}
            countdown={countdown}
            onSnap={handleSnap}
            onChangeFrame={handleChangeFrame}
            onRetake={() => {
               if (countdownRef.current) clearInterval(countdownRef.current);
               countdownRef.current = null;
               setCountdown(null);
               setIsCapturing(false);
               clearPhotos();
               resetPhotoSession();
               showToast("Sesi foto diulang dengan frame yang sama.", "info");
            }}
            onSwitchCamera={hasMultipleCameras ? switchCamera : undefined}
          />
        </div>
      </main>
    </div>
  );
}
