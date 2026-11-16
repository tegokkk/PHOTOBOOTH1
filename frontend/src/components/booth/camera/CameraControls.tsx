interface CameraControlsProps {
  hasPermission: boolean | null;
  photoCount: number;
  currentPhotoIndex: number;
  countdown: number | null;
  onSnap: () => void;
  onChangeFrame?: () => void;
  onRetake?: () => void;
  onSwitchCamera?: () => void;
}

export function CameraControls({
  hasPermission,
  photoCount,
  currentPhotoIndex,
  countdown,
  onSnap,
  onChangeFrame,
  onRetake,
  onSwitchCamera,
}: CameraControlsProps) {
  if (!hasPermission) return null;

  return (
    <div className="mt-5 flex flex-col items-center gap-4 w-full z-20 pb-4">
      <button
        type="button"
        onClick={onSnap}
        disabled={countdown !== null || currentPhotoIndex >= photoCount}
        className="relative group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
        aria-label="Ambil Foto"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-[#0038FF] bg-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-105">
          <div className="w-14 h-14 md:w-18 md:h-18 rounded-full bg-[#CCFF00] text-black flex items-center justify-center transition-colors shadow-inner">
            <span
              className="material-symbols-outlined text-2xl md:text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              photo_camera
            </span>
          </div>
        </div>
      </button>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {onChangeFrame && (
          <button
            type="button"
            onClick={onChangeFrame}
            className="min-h-[44px] bg-[#0038FF] hover:bg-[#002db3] text-white px-4 py-2.5 rounded-full font-bold text-xs uppercase transition-colors flex items-center gap-2 cursor-pointer"
            aria-label="Ganti frame"
          >
            <span className="material-symbols-outlined text-lg">
              filter_frames
            </span>
            <span className="hidden sm:inline">Ganti Frame</span>
          </button>
        )}

        <button
          type="button"
          onClick={onRetake}
          className="min-h-[44px] bg-[#F8F9FA] hover:bg-gray-200 text-black px-4 py-2.5 rounded-full font-bold text-xs uppercase transition-colors flex items-center gap-2 cursor-pointer"
          aria-label="Ambil ulang foto"
        >
          <span className="material-symbols-outlined text-lg">undo</span>
          <span>Ulangi</span>
        </button>

        {onSwitchCamera && (
          <button
            type="button"
            onClick={onSwitchCamera}
            className="min-h-[44px] bg-[#F8F9FA] hover:bg-gray-200 text-black px-4 py-2.5 rounded-full font-bold text-xs uppercase transition-colors flex items-center gap-2 cursor-pointer"
            aria-label="Tukar kamera"
          >
            <span className="material-symbols-outlined text-lg">
              flip_camera_ios
            </span>
            <span className="hidden sm:inline">Kamera</span>
          </button>
        )}
      </div>

      <p className="text-xs font-bold text-white/80 text-center">
        {photoCount > 1
          ? `Pose ${Math.min(currentPhotoIndex + 1, photoCount)} dari ${photoCount}`
          : "Siap? Tekan tombol kamera untuk memotret"}
      </p>
    </div>
  );
}
