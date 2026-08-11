"use client";

import { useAppStore } from "@/store/useAppStore";
import { Slider } from "@/components/ui/Slider";

export function EditPanel() {
  const { 
    brightness, setBrightness,
    contrast, setContrast,
    saturation, setSaturation,
    resetEdits,
  } = useAppStore();

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between border-b-2 border-ink-black pb-2 mb-4">
        <h3 className="font-headline-lg-mobile text-ink-black">Edit Foto</h3>
        <button 
          onClick={resetEdits}
          className="text-on-surface-variant font-label-caps text-label-caps hover:text-curtain-red transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>history</span>
          Reset
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between font-label-caps text-label-caps">
          <span>Kecerahan</span>
          <span className="text-secondary">{brightness}%</span>
        </div>
        <Slider 
          value={[brightness]} 
          min={0} max={200} step={1} 
          onValueChange={(val) => setBrightness(Array.isArray(val) ? val[0] : val as unknown as number)} 
          className="cursor-pointer"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between font-label-caps text-label-caps">
          <span>Kontras</span>
          <span className="text-secondary">{contrast}%</span>
        </div>
        <Slider 
          value={[contrast]} 
          min={0} max={200} step={1} 
          onValueChange={(val) => setContrast(Array.isArray(val) ? val[0] : val as unknown as number)} 
          className="cursor-pointer"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between font-label-caps text-label-caps">
          <span>Saturasi</span>
          <span className="text-secondary">{saturation}%</span>
        </div>
        <Slider 
          value={[saturation]} 
          min={0} max={200} step={1} 
          onValueChange={(val) => setSaturation(Array.isArray(val) ? val[0] : val as unknown as number)} 
          className="cursor-pointer"
        />
      </div>
    </div>
  );
}
