"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import { useAppStore } from "@/store/useAppStore";
import { useUIStore } from "@/store/useUIStore";
import { getFramePreviewUrl, getFrameMetaFromFrame } from "@/lib/frameMeta";
import { CameraOverlays } from "./camera/CameraOverlays";
import { BoothHeader } from "./BoothHeader";

export function CameraScreen() {
  const {
    videoRef,
    hasPermission,
    requestPermission,
    capturePhoto,
    error,
    stopCamera,
    hasMultipleCameras,
    switchCamera,
    facingMode,
  } = useCamera();
  const {
    capturedPhotos,
    completePhotoCapture,
    clearPhotos,
    setCurrentStep,
    selectedFrameId,
    frames,
    currentPhotoIndex,
    setPhotoSession,
    resetPhotoSession,
    retakeQueue,
    cancelRetake,
    timerDuration,
    setTimerDuration,
  } = useAppStore();
  const { showToast } = useUIStore();

  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const captureFinishRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captureBusyRef = useRef(false);
  const isRetaking = retakeQueue.length > 0;

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
  }, [
    photoCount,
    hasPermission,
    currentPhotoIndex,
    capturedPhotos.length,
    requestPermission,
    setPhotoSession,
  ]);

  /** Do the actual capture → store photo → decide next step */
  const doCapture = useCallback(() => {
    const photo = capturePhoto();
    if (!photo) {
      captureBusyRef.current = false;
      setIsCapturing(false);
      showToast("Gagal mengambil foto. Coba lagi.", "error");
      return;
    }

    setFlashVisible(true);
    captureFinishRef.current = setTimeout(() => {
      setFlashVisible(false);
      setIsCapturing(false);
      captureBusyRef.current = false;
      completePhotoCapture(photo, facingMode === "user");
      const session = useAppStore.getState();
      if (session.currentStep === "review") {
        showToast("Foto selesai. Periksa hasil dan pilih kolom untuk retake jika perlu.", "success");
      } else {
        showToast(
          `Siap untuk kolom ${session.currentPhotoIndex + 1}/${session.totalPhotosNeeded}.`,
          "info"
        );
      }
    }, 300);
  }, [capturePhoto, completePhotoCapture, facingMode, showToast]);

  /** Countdown with user-selected duration (3s, 5s, 10s) then capture */
  const startCountdown = useCallback(() => {
    if (captureBusyRef.current || !hasPermission) return;
    captureBusyRef.current = true;
    setIsCapturing(true);
    let n = timerDuration;
    setCountdown(n);
    countdownRef.current = setInterval(() => {
      n--;
      if (n <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        setCountdown(null);
        doCapture();
      } else {
        setCountdown(n);
      }
    }, 1000);
  }, [timerDuration, hasPermission, doCapture]);

  const handleSnap = () => {
    if (countdown !== null) return;
    startCountdown();
  };

  const handleCancelCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);
    setIsCapturing(false);
    captureBusyRef.current = false;
    showToast("Hitung mundur dibatalkan", "info");
  }, [showToast]);

  const handleChangeFrame = () => {
    if (
      capturedPhotos.some(Boolean) &&
      !window.confirm(
        "Foto yang sudah diambil akan dihapus. Yakin ingin mengganti frame?"
      )
    ) {
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
    captureBusyRef.current = false;
    if (isRetaking) {
      cancelRetake();
      return;
    }
    clearPhotos();
    resetPhotoSession();
    showToast("Sesi foto diulang dengan frame yang sama.", "info");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        if (countdown !== null) {
          e.preventDefault();
          handleCancelCountdown();
        }
        return;
      }
      if (
        e.target instanceof Element &&
        e.target.closest("button, a, input, textarea, select, [contenteditable='true']")
      )
        return;
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        if (countdown === null && currentPhotoIndex < photoCount) {
          startCountdown();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [countdown, currentPhotoIndex, photoCount, startCountdown, handleCancelCountdown]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (captureFinishRef.current) clearTimeout(captureFinishRef.current);
    };
  }, []);

  const filledCount = capturedPhotos.filter(Boolean).length;

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-studio-pattern relative overflow-x-hidden">
      <BoothHeader
        currentStep={2}
        rightSlot={
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#CCFF00] text-black text-xs font-black uppercase shadow-sm">
            <span className="material-symbols-outlined text-[16px]">timer</span>
            <span>{timerDuration} Detik</span>
          </span>
        }
      />

      <main className="flex-grow p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-[1440px] flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-6 relative z-10">
          {/* LEFT: Pengaturan & Status Frame */}
          <div className="w-full max-w-md lg:max-w-none lg:w-72 xl:w-80 flex-shrink-0 order-3 lg:order-1 bg-white rounded-[2rem] shadow-2xl p-5 md:p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3.5">
              <div className="w-10 h-10 rounded-full bg-[#0038FF] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">tune</span>
              </div>
              <div>
                <h2 className="text-base md:text-lg font-black uppercase text-black leading-tight">
                  Opsi Studio
                </h2>
                <p className="text-xs font-semibold text-black/55">
                  Bingkai & kamera
                </p>
              </div>
            </div>

            {/* Active Frame Summary */}
            <div className="rounded-[1.5rem] bg-[#F8F9FA] border border-gray-100 p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-black/50">
                  Bingkai Aktif
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#CCFF00] text-black text-[11px] font-black uppercase">
                  {isRetaking ? "Retake" : `${photoCount} Pose`}
                </span>
              </div>
              <span className="font-black text-sm text-black truncate">
                {currentFrame?.name || "Tanpa Bingkai"}
              </span>

              {/* Visual Slot Progress Pills */}
              <div className="pt-1 flex items-center gap-1.5">
                {Array.from({ length: photoCount }).map((_, idx) => {
                  const isDone = Boolean(capturedPhotos[idx]);
                  const isCurrent = idx === currentPhotoIndex;
                  return (
                    <div
                      key={idx}
                      className={`h-2.5 flex-1 rounded-full transition-all ${
                        isDone
                          ? "bg-[#CCFF00] ring-1 ring-black/15"
                          : isCurrent
                          ? "bg-[#0038FF]"
                          : "bg-gray-200"
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-[11px] text-black/60 font-bold">
                {isRetaking ? `Retake kolom ${currentPhotoIndex + 1} · ${retakeQueue.length} kolom tersisa` : `${filledCount} dari ${photoCount} foto selesai`}
              </span>
            </div>

            {/* Action Pill Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleChangeFrame}
                disabled={isCapturing}
                className="w-full min-h-[48px] py-3 px-4 rounded-full bg-[#0038FF] hover:bg-[#002db3] text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
                aria-label="Ganti Frame"
              >
                <span className="material-symbols-outlined text-lg">
                  filter_frames
                </span>
                <span>Ganti Bingkai</span>
              </button>

              <button
                type="button"
                onClick={handleRetake}
                disabled={
                  isCapturing ||
                  (currentPhotoIndex === 0 && capturedPhotos.length === 0)
                }
                className="w-full min-h-[48px] py-3 px-4 rounded-full bg-[#F8F9FA] hover:bg-red-50 text-black hover:text-red-600 border border-gray-200 hover:border-red-200 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                aria-label={isRetaking ? "Kembali ke pemeriksaan" : "Ulangi Foto"}
              >
                <span className="material-symbols-outlined text-lg">undo</span>
                <span>{isRetaking ? "Kembali ke Pemeriksaan" : "Ulangi dari Awal"}</span>
              </button>

              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={switchCamera}
                  disabled={isCapturing}
                  className="w-full min-h-[48px] py-3 px-4 rounded-full bg-[#F8F9FA] hover:bg-gray-200 text-black border border-gray-200 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  aria-label="Tukar Kamera"
                >
                  <span className="material-symbols-outlined text-lg text-[#0038FF]">
                    flip_camera_ios
                  </span>
                  <span>Tukar Kamera</span>
                </button>
              )}
            </div>

            <div className="mt-auto rounded-2xl bg-[#CCFF00]/30 border border-[#CCFF00] p-3.5 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-black text-lg shrink-0 mt-0.5">
                tips_and_updates
              </span>
              <p className="text-xs font-semibold text-black/80 leading-relaxed">
                Pastikan posisi wajah berada di dalam kotak slot sebelum hitung mundur selesai.
              </p>
            </div>
          </div>

          {/* CENTER: Main Live Camera Stage */}
          <div className="w-full max-w-md lg:max-w-none lg:w-auto flex-shrink order-1 lg:order-2 bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="font-black text-sm uppercase text-black">
                  {isRetaking ? `Retake Kolom ${currentPhotoIndex + 1}` : "Live Studio Camera"}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#CCFF00] text-black text-xs font-black uppercase">
                Pose {Math.min(currentPhotoIndex + 1, photoCount)} / {photoCount}
              </span>
            </div>

            <div className="p-4 md:p-5 flex-1 flex flex-col items-center justify-center bg-[#F8F9FA]">
              <div className="relative w-fit max-w-full rounded-[1.5rem] bg-black p-2 shadow-inner flex items-center justify-center overflow-hidden">
                {previewFrameUrl ? (
                  <img
                    src={previewFrameUrl}
                    alt=""
                    className="relative block w-auto h-auto max-w-full max-h-[min(64vh,660px)] object-contain opacity-0 pointer-events-none"
                    aria-hidden="true"
                  />
                ) : (
                  <div className="w-[min(90vw,500px)] aspect-[4/3]" />
                )}

                {photoCount > 1 &&
                  frameMeta?.slots &&
                  frameMeta.slots.map((slot, i) => {
                    if (i === currentPhotoIndex || !capturedPhotos[i]) return null;
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
                        }}
                      />
                    );
                  })}

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute object-cover transition-all duration-300 z-10 ${
                    facingMode === "user" ? "transform scale-x-[-1]" : ""
                  }`}
                  style={
                    frameMeta?.slots && frameMeta.slots[currentPhotoIndex]
                      ? {
                          left: `${frameMeta.slots[currentPhotoIndex].x * 100}%`,
                          top: `${frameMeta.slots[currentPhotoIndex].y * 100}%`,
                          width: `${frameMeta.slots[currentPhotoIndex].width * 100}%`,
                          height: `${frameMeta.slots[currentPhotoIndex].height * 100}%`,
                        }
                      : { left: 0, top: 0, width: "100%", height: "100%" }
                  }
                />

                {previewFrameUrl && (
                  <img
                    src={previewFrameUrl}
                    alt="Frame Overlay"
                    className="absolute inset-0 w-full h-full object-fill z-20 pointer-events-none [image-rendering:auto]"
                  />
                )}

                <div className="absolute inset-0 z-30 pointer-events-none">
                  <CameraOverlays
                    hasPermission={hasPermission}
                    error={error}
                    onRequestPermission={() => requestPermission()}
                    countdown={countdown}
                    flashVisible={flashVisible}
                    frameMeta={frameMeta}
                    currentPhotoIndex={currentPhotoIndex}
                    onCancel={handleCancelCountdown}
                  />
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-between w-full px-1">
                <span className="text-xs font-bold text-black/60">
                  {isRetaking ? `${retakeQueue.length} kolom pilihan tersisa` : photoCount - currentPhotoIndex - 1 > 0
                    ? `${photoCount - currentPhotoIndex - 1} pose tersisa`
                    : "Pose terakhir"}
                </span>
                {countdown !== null ? (
                  <button
                    type="button"
                    onClick={handleCancelCountdown}
                    className="text-xs text-white bg-red-600 hover:bg-red-700 px-3.5 py-1 rounded-full font-black uppercase flex items-center gap-1 cursor-pointer transition-colors"
                    aria-label="Batalkan Countdown"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      close
                    </span>
                    Batal ({countdown}s)
                  </button>
                ) : (
                  <span className="text-[11px] font-black uppercase text-white bg-[#0038FF] px-3 py-1 rounded-full">
                    {facingMode === "user" ? "Kamera Depan (Mirror)" : "Kamera Belakang"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Kontrol Pemotretan (Shutter & Timer) */}
          <div className="w-full max-w-md lg:max-w-none lg:w-72 xl:w-80 flex-shrink-0 order-2 lg:order-3 bg-white rounded-[2rem] shadow-2xl p-5 md:p-6 flex flex-col items-center justify-between gap-5 text-center">
            <div className="w-full flex items-center gap-3 border-b border-gray-100 pb-3.5 text-left">
              <div className="w-10 h-10 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  photo_camera
                </span>
              </div>
              <div>
                <h2 className="text-base md:text-lg font-black uppercase text-black leading-tight">
                  {isRetaking ? "Retake Foto" : "Ambil Foto"}
                </h2>
                <p className="text-xs font-semibold text-black/55">
                  Pose {Math.min(currentPhotoIndex + 1, photoCount)} dari {photoCount}
                </p>
              </div>
            </div>

            {/* Tactile Hero Shutter Button */}
            <div className="flex flex-col items-center gap-3 my-1">
              <button
                type="button"
                onClick={countdown !== null ? handleCancelCountdown : handleSnap}
                disabled={currentPhotoIndex >= photoCount || !hasPermission || (isCapturing && countdown === null)}
                className="relative group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label={countdown !== null ? "Batalkan Countdown" : "Ambil Foto"}
              >
                <div
                  className={`w-28 h-28 md:w-32 md:h-32 rounded-full p-2.5 flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-active:scale-95 ${
                    countdown !== null
                      ? "bg-red-100 border-4 border-red-500 shadow-xl"
                      : "bg-[#0038FF]/15 border-4 border-[#0038FF] shadow-[0_14px_30px_rgba(0,56,255,0.28)]"
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-full flex items-center justify-center transition-colors shadow-inner ${
                      countdown !== null
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-[#CCFF00] group-hover:bg-[#d8ff33] text-black"
                    }`}
                  >
                    {countdown !== null ? (
                      <span className="text-4xl font-black">{countdown}</span>
                    ) : (
                      <span
                        className="material-symbols-outlined text-4xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        photo_camera
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {countdown !== null ? (
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCancelCountdown}
                    className="min-h-[44px] px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">
                      cancel
                    </span>
                    Batalkan ({countdown}s)
                  </button>
                  <span className="text-[11px] font-bold text-black/50">
                    Atau tekan tombol [ESC]
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="font-black text-base uppercase text-black">
                    Tekan Shutter
                  </span>
                  <span className="text-xs font-semibold text-black/55">
                    Atau tekan{" "}
                    <kbd className="px-2 py-0.5 rounded-md bg-[#F8F9FA] border border-gray-200 font-mono text-[11px] text-black">
                      Spasi
                    </kbd>
                  </span>
                </div>
              )}
            </div>

            {/* Timer Duration Selector */}
            <div className="w-full rounded-[1.5rem] bg-[#F8F9FA] border border-gray-100 p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#0038FF]">
                    timer
                  </span>
                  Timer
                </span>
                <span className="text-xs font-black text-[#0038FF]">
                  {timerDuration} Detik
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
                        showToast(`Timer diatur ke ${seconds} detik`, "info");
                      }}
                      disabled={isCapturing}
                      className={`min-h-[44px] py-2 px-2 rounded-full font-black text-xs uppercase transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer ${
                        isSelected
                          ? "bg-[#0038FF] text-white shadow-md"
                          : "bg-white text-black/70 border border-gray-200 hover:border-[#0038FF] hover:text-[#0038FF]"
                      }`}
                      aria-label={`Timer ${seconds} detik`}
                    >
                      {seconds}s
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
