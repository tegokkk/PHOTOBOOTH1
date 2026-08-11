interface Slot {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CameraOverlaysProps {
  hasPermission: boolean | null;
  error: string | null;
  onRequestPermission: () => void;
  countdown: number | null;
  flashVisible: boolean;
  frameMeta?: { slots: Slot[] } | null;
  currentPhotoIndex: number;
}

export function CameraOverlays({
  hasPermission,
  error,
  onRequestPermission,
  countdown,
  flashVisible,
  frameMeta,
  currentPhotoIndex,
}: CameraOverlaysProps) {
  return (
    <>
      {/* Camera permission denied */}
      {hasPermission === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface-container-high p-8 text-center z-40">
          <span className="material-symbols-outlined text-5xl text-curtain-red">
            no_photography
          </span>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black">
            Akses Kamera Ditolak
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Izinkan akses kamera di browser Anda untuk menggunakan Photobooth.
          </p>
          {error && (
            <p className="font-label-caps text-label-caps text-curtain-red text-sm">
              {error}
            </p>
          )}
          <button
            onClick={onRequestPermission}
            className="px-6 py-3 bg-curtain-red text-paper-white font-interactive-btn text-interactive-btn border-2 border-ink-black sketch-border hard-shadow"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Loading state */}
      {hasPermission === null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm z-40">
          <div className="w-8 h-8 border-4 border-paper-white border-t-curtain-red rounded-full animate-spin" />
          <p className="text-paper-white font-label-caps text-label-caps text-sm">
            Meminta akses kamera...
          </p>
        </div>
      )}

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/30">
          <span className="font-headline-lg text-paper-white drop-shadow-lg animate-ping text-[100px] leading-none">
            {countdown}
          </span>
        </div>
      )}

      {/* Flash */}
      {flashVisible && (
        <div className="absolute inset-0 bg-white z-40 pointer-events-none" />
      )}

      {/* Slot indicator overlay */}
      {hasPermission && frameMeta && frameMeta.slots.length > 0 && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {frameMeta.slots.map((slot, i) => (
            <div
              key={i}
              className={`absolute border-2 transition-all duration-300 ${
                i === currentPhotoIndex
                  ? "border-curtain-red bg-curtain-red/10"
                  : i < currentPhotoIndex
                  ? "border-green-500 bg-green-500/10"
                  : "border-paper-white/30"
              }`}
              style={{
                left: `${slot.x * 100}%`,
                top: `${slot.y * 100}%`,
                width: `${slot.width * 100}%`,
                height: `${slot.height * 100}%`,
              }}
            >
              {i === currentPhotoIndex && (
                <div className="absolute top-1 left-1 bg-curtain-red text-paper-white text-[10px] font-label-caps px-1">
                  Slot {i + 1}
                </div>
              )}
              {i < currentPhotoIndex && (
                <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] font-label-caps px-1 flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-[10px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decorative corner tapes */}
      <div className="absolute top-0 left-0 w-10 h-5 bg-yellow-200/80 -rotate-45 -translate-x-2 -translate-y-1 mix-blend-multiply z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-10 h-5 bg-yellow-200/80 rotate-45 translate-x-2 -translate-y-1 mix-blend-multiply z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-10 h-5 bg-yellow-200/80 rotate-45 -translate-x-2 translate-y-1 mix-blend-multiply z-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-10 h-5 bg-yellow-200/80 -rotate-45 translate-x-2 translate-y-1 mix-blend-multiply z-20 pointer-events-none" />
    </>
  );
}
