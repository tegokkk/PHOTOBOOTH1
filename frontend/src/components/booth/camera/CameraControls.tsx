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
    <div className="fixed bottom-[110px] md:bottom-8 left-0 right-0 z-50 flex flex-col items-center pointer-events-none">
      <div className="flex flex-col items-center gap-2 pointer-events-auto">
        
        {/* Helper text (optional, positioned above the button) */}
        <div className="bg-paper-white/90 backdrop-blur-sm px-4 py-1 border-2 border-ink-black sketch-border-thin hard-shadow-sm mb-2 rounded-full">
          {photoCount > 1 ? (
            <p className="font-label-caps text-xs text-ink-black text-center">
              {currentPhotoIndex < photoCount
                ? `FOTO ${currentPhotoIndex + 1} DARI ${photoCount}`
                : "SELESAI!"}
            </p>
          ) : (
            <p className="font-label-caps text-xs text-ink-black text-center">
              STRIKE A POSE! <span className="text-curtain-red">★</span>
            </p>
          )}
        </div>

        {/* Modern Shutter Button */}
        <button
          onClick={onSnap}
          disabled={countdown !== null || currentPhotoIndex >= photoCount}
          className="
            relative flex items-center justify-center
            w-20 h-20 md:w-24 md:h-24 rounded-full
            bg-paper-white
            border-4 border-ink-black
            shadow-[4px_4px_0px_0px_rgba(15,15,15,1)]
            hover:scale-105 active:scale-95 active:shadow-[0px_0px_0px_0px_rgba(15,15,15,1)] active:translate-x-1 active:translate-y-1
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100
            group
          "
          aria-label="Ambil Foto"
        >
          {/* Inner ring to make it look like a camera shutter */}
          <div className="absolute inset-1 rounded-full border-[3px] border-curtain-red transition-all group-active:inset-2" />
          
          <span
            className="material-symbols-outlined text-4xl md:text-5xl text-curtain-red z-10 transition-transform group-hover:scale-110 group-active:scale-95"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            photo_camera
          </span>
        </button>
      </div>
    </div>
  );
}
