interface CameraControlsProps {
  hasPermission: boolean | null;
  photoCount: number;
  currentPhotoIndex: number;
  countdown: number | null;
  onSnap: () => void;
}

export function CameraControls({
  hasPermission,
  photoCount,
  currentPhotoIndex,
  countdown,
  onSnap,
}: CameraControlsProps) {
  if (!hasPermission) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      {photoCount > 1 && (
        <p className="font-body-md text-body-md text-ink-black italic text-center max-w-xs">
          {currentPhotoIndex < photoCount
            ? `Ambil foto ${currentPhotoIndex + 1} dari ${photoCount} — berpose!`
            : "Semua foto siap! Menuju preview..."}
        </p>
      )}
      {photoCount === 1 && (
        <p className="font-body-md text-body-md text-ink-black font-bold italic -rotate-2 text-center">
          Strike a pose!{" "}
          <span className="material-symbols-outlined align-middle text-curtain-red">
            star
          </span>
        </p>
      )}

      <button
        onClick={onSnap}
        disabled={countdown !== null || currentPhotoIndex >= photoCount}
        className="
          bg-curtain-red text-paper-white
          font-interactive-btn text-interactive-btn
          px-12 py-5 border-[3px] border-ink-black
          sketch-border hard-shadow
          hover:scale-[1.02] hover:-rotate-1 hover:bg-[#ff2020]
          active:scale-95 active:rotate-0
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-3 group
        "
      >
        <span
          className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          photo_camera
        </span>
        Jepret!
      </button>
    </div>
  );
}
