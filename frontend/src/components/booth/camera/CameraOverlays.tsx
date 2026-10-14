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
  onCancel?: () => void;
}

export function CameraOverlays({
  hasPermission,
  error,
  onRequestPermission,
  countdown,
  flashVisible,
  frameMeta,
  currentPhotoIndex,
  onCancel,
}: CameraOverlaysProps) {
  return (
    <>
      {/* Camera permission denied */}
      {hasPermission === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink-black/80 backdrop-blur-md p-8 text-center z-50 pointer-events-auto">
          <span className="material-symbols-outlined text-5xl text-error-red">
            no_photography
          </span>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-stark-white uppercase">
            KAMERA TIDAK BISA DIAKSES
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
            Izinkan akses kamera pada browser, lalu tekan tombol di bawah untuk mencoba lagi.
          </p>
          {error && (
            <p className="font-tech-mono text-error-red text-sm bg-ink-black px-2 py-1 border border-error-red">
              {error}
            </p>
          )}
          <button
            onClick={onRequestPermission}
            className="mt-4 px-6 py-3 bg-neon-yellow text-ink-black font-tech-mono font-bold border-border-thick border-ink-black hard-shadow jiggle-active"
          >
            COBA LAGI
          </button>
        </div>
      )}

      {/* Loading state */}
      {hasPermission === null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-black/80 backdrop-blur-sm z-50">
          <div className="w-12 h-12 border-4 border-stark-white border-t-neon-yellow rounded-full animate-spin" />
          <p className="text-neon-yellow font-tech-mono uppercase tracking-widest text-sm animate-pulse">
            MENYIAPKAN KAMERA...
          </p>
        </div>
      )}

      {/* Persistent Scanlines Overlay */}
      {hasPermission && (
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50 z-20"></div>
      )}

      {/* Grid Overlay */}
      {hasPermission && (
        <div className="absolute inset-0 pointer-events-none opacity-30 z-20">
          <div className="absolute left-1/3 top-0 bottom-0 border-l border-stark-white border-dashed"></div>
          <div className="absolute right-1/3 top-0 bottom-0 border-l border-stark-white border-dashed"></div>
          <div className="absolute top-1/3 left-0 right-0 border-t border-stark-white border-dashed"></div>
          <div className="absolute bottom-1/3 left-0 right-0 border-t border-stark-white border-dashed"></div>
          {/* Central Reticle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-neon-yellow flex items-center justify-center opacity-70">
            <div className="w-2 h-2 bg-neon-yellow"></div>
          </div>
        </div>
      )}

      {/* Recording Indicator */}
      {hasPermission && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-ink-black/80 px-3 py-1 border border-stark-white/30 backdrop-blur-sm z-30">
          <div className="w-3 h-3 rounded-full bg-error-red animate-pulse"></div>
          <span className="font-tech-mono text-[10px] text-stark-white uppercase">REC</span>
        </div>
      )}

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-ink-black/50 backdrop-blur-[2px] pointer-events-auto">
          <span className="font-headline-xl text-stark-white text-[130px] md:text-[180px] font-black drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] animate-pulse leading-none select-none">
            {countdown}
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="mt-6 px-6 py-2.5 bg-error-red text-stark-white font-tech-mono font-bold text-xs md:text-sm uppercase tracking-widest border-2 border-stark-white hard-shadow hover:scale-105 active:scale-95 transition-all flex items-center gap-2 jiggle-active cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">close</span>
              BATALKAN FOTO
            </button>
          )}
        </div>
      )}

      {/* Flash */}
      {flashVisible && (
        <div className="absolute inset-0 bg-stark-white z-50 pointer-events-none" />
      )}

      {/* Slot indicator overlay */}
      {hasPermission && frameMeta && frameMeta.slots.length > 0 && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {frameMeta.slots.map((slot, i) => (
            <div
              key={i}
              className={`absolute border-2 transition-all duration-300 ${
                i === currentPhotoIndex
                  ? "border-neon-yellow bg-neon-yellow/10"
                  : i < currentPhotoIndex
                  ? "border-cyber-purple bg-cyber-purple/20"
                  : "border-stark-white/30"
              }`}
              style={{
                left: `${slot.x * 100}%`,
                top: `${slot.y * 100}%`,
                width: `${slot.width * 100}%`,
                height: `${slot.height * 100}%`,
              }}
            >
              {i === currentPhotoIndex && (
                <div className="absolute top-1 left-1 bg-neon-yellow text-ink-black text-[10px] font-tech-mono font-bold px-1 uppercase border border-ink-black">
                  FOTO {i + 1}
                </div>
              )}
              {i < currentPhotoIndex && (
                <div className="absolute top-1 left-1 bg-cyber-purple text-neon-yellow text-[10px] font-tech-mono font-bold px-1 flex items-center gap-1 border border-neon-yellow">
                  <span
                    className="material-symbols-outlined text-[10px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                    SELESAI
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decorative corner tapes */}
      <div className="absolute top-[-2px] left-[-14px] w-[40px] h-[12px] bg-ink-black -rotate-45 z-30 pointer-events-none" />
      <div className="absolute top-[-2px] right-[-14px] w-[40px] h-[12px] bg-ink-black rotate-45 z-30 pointer-events-none" />
      <div className="absolute bottom-[-2px] left-[-14px] w-[40px] h-[12px] bg-ink-black rotate-45 z-30 pointer-events-none" />
      <div className="absolute bottom-[-2px] right-[-14px] w-[40px] h-[12px] bg-ink-black -rotate-45 z-30 pointer-events-none" />
    </>
  );
}
