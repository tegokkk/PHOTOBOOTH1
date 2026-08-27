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
      <div className="flex items-center justify-end border-ink-black pb-2 mb-4">
        <button 
          onClick={resetEdits}
          className="text-on-surface-variant font-tech-mono text-[10px] uppercase hover:text-neon-yellow transition-colors flex items-center gap-1 bg-ink-black px-2 py-1 border border-ink-black"
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>history</span>
          RESET_ALL
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between font-tech-mono text-[10px] uppercase text-on-surface-variant">
          <span>BRIGHTNESS</span>
          <span className="text-stark-white">{brightness}%</span>
        </div>
        <Slider 
          value={[brightness]} 
          min={0} max={200} step={1} 
          onValueChange={(val) => setBrightness(Array.isArray(val) ? val[0] : val as unknown as number)} 
          className="cursor-pointer"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between font-tech-mono text-[10px] uppercase text-on-surface-variant">
          <span>CONTRAST</span>
          <span className="text-stark-white">{contrast}%</span>
        </div>
        <Slider 
          value={[contrast]} 
          min={0} max={200} step={1} 
          onValueChange={(val) => setContrast(Array.isArray(val) ? val[0] : val as unknown as number)} 
          className="cursor-pointer"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between font-tech-mono text-[10px] uppercase text-on-surface-variant">
          <span>SATURATION</span>
          <span className="text-stark-white">{saturation}%</span>
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
