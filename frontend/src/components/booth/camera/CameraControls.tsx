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
      {/* Shutter stays as the primary action. Secondary actions are grouped directly below it. */}
      <button 
        onClick={onSnap}
        disabled={countdown !== null || currentPhotoIndex >= photoCount}
        className="relative group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed jiggle-active transition-transform"
        aria-label="Ambil Foto"
      >
        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-ink-black bg-stark-white hard-shadow flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95">
          <div className="w-14 h-14 md:w-24 md:h-24 rounded-full border-4 border-ink-black bg-neon-yellow flex items-center justify-center">
            <div className="w-6 h-6 md:w-10 md:h-10 rounded-full border-2 border-ink-black bg-stark-white"></div>
          </div>
        </div>
      </button>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onChangeFrame && (
          <button
            onClick={onChangeFrame}
            className="bg-surface-container text-stark-white border-border-thick border-stark-white px-4 py-3 font-tech-mono font-bold uppercase hard-shadow-sm jiggle-active hover:bg-neon-yellow hover:text-ink-black hover:border-ink-black transition-colors flex items-center gap-2"
            aria-label="Ganti frame"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>filter_frames</span>
            <span className="hidden sm:inline">GANTI FRAME</span>
          </button>
        )}

        <button
          onClick={onRetake}
          className="bg-stark-white text-ink-black border-border-thick border-ink-black px-4 py-3 font-tech-mono font-bold uppercase hard-shadow-sm jiggle-active hover:bg-surface-variant hover:text-stark-white transition-colors flex items-center gap-2"
          aria-label="Ambil ulang foto"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>undo</span>
          <span>ULANGI</span>
        </button>

        {onSwitchCamera && (
          <button
            onClick={onSwitchCamera}
            className="bg-surface-container text-stark-white border-border-thick border-stark-white px-4 py-3 font-tech-mono font-bold uppercase hard-shadow-sm jiggle-active hover:bg-neon-yellow hover:text-ink-black hover:border-ink-black transition-colors flex items-center gap-2"
            aria-label="Tukar kamera"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>flip_camera_ios</span>
            <span className="hidden sm:inline">KAMERA</span>
          </button>
        )}
      </div>

      <p className="font-tech-mono text-[10px] text-stark-white/80 uppercase tracking-widest text-center">
        {photoCount > 1 ? `FOTO ${Math.min(currentPhotoIndex + 1, photoCount)} DARI ${photoCount}` : "SIAP? TEKAN TOMBOL KAMERA"}
      </p>
    </div>
  );
}
