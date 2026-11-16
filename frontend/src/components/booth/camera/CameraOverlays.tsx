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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3.5 bg-[#001A99]/95 backdrop-blur-md p-6 md:p-8 text-center z-50 pointer-events-auto rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-red-500/20 border-2 border-red-400 text-red-300 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">
              no_photography
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-black uppercase text-white">
            Kamera Tidak Dapat Diakses
          </h2>
          <p className="text-xs md:text-sm text-white/80 max-w-xs leading-relaxed">
            Izinkan akses kamera pada browser perangkat ini, lalu tekan tombol di bawah untuk mencoba lagi.
          </p>
          {error && (
            <p className="text-red-200 text-xs bg-red-950/70 px-3 py-1.5 rounded-xl border border-red-500/40 max-w-xs">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={onRequestPermission}
            className="mt-2 min-h-[46px] px-7 py-2.5 rounded-full bg-[#CCFF00] hover:bg-white text-black font-black text-xs uppercase shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Loading state */}
      {hasPermission === null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#001A99]/85 backdrop-blur-xs z-50 rounded-2xl">
          <div className="w-11 h-11 border-4 border-white/25 border-t-[#CCFF00] rounded-full animate-spin" />
          <p className="text-[#CCFF00] font-black uppercase text-xs tracking-wider">
            Menyiapkan Kamera...
          </p>
        </div>
      )}

      {/* Subtle Rule-of-Thirds Grid */}
      {hasPermission && (
        <div className="absolute inset-0 pointer-events-none opacity-20 z-20">
          <div className="absolute left-1/3 top-0 bottom-0 border-l border-white/60" />
          <div className="absolute right-1/3 top-0 bottom-0 border-l border-white/60" />
          <div className="absolute top-1/3 left-0 right-0 border-t border-white/60" />
          <div className="absolute bottom-1/3 left-0 right-0 border-t border-white/60" />
        </div>
      )}

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/35 backdrop-blur-[1px] pointer-events-auto">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#0038FF]/85 border-4 border-[#CCFF00] backdrop-blur-md flex items-center justify-center shadow-2xl">
            <span className="text-[#CCFF00] text-7xl md:text-8xl font-black drop-shadow-md leading-none select-none">
              {countdown}
            </span>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="mt-5 min-h-[44px] px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase shadow-lg border-2 border-white active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">close</span>
              Batalkan Foto
            </button>
          )}
        </div>
      )}

      {/* Camera Shutter Flash */}
      {flashVisible && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-200" />
      )}

      {/* Slot indicator overlay */}
      {hasPermission && frameMeta && frameMeta.slots.length > 0 && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {frameMeta.slots.map((slot, i) => (
            <div
              key={i}
              className={`absolute transition-all duration-300 ${
                i === currentPhotoIndex
                  ? "ring-2 ring-[#CCFF00]"
                  : i < currentPhotoIndex
                  ? "ring-1 ring-[#0038FF]"
                  : "ring-1 ring-white/25"
              }`}
              style={{
                left: `${slot.x * 100}%`,
                top: `${slot.y * 100}%`,
                width: `${slot.width * 100}%`,
                height: `${slot.height * 100}%`,
              }}
            >
              {i === currentPhotoIndex && (
                <div className="absolute top-1.5 left-1.5 bg-[#CCFF00] text-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
                  Pose {i + 1}
                </div>
              )}
              {i < currentPhotoIndex && (
                <div className="absolute top-1.5 left-1.5 bg-[#0038FF] text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                  <span
                    className="material-symbols-outlined text-[11px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                  Selesai
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
