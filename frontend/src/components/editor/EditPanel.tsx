"use client";

import { useAppStore } from "@/store/useAppStore";
import { Slider } from "@/components/ui/Slider";

export function EditPanel() {
  const {
    brightness,
    setBrightness,
    contrast,
    setContrast,
    saturation,
    setSaturation,
  } = useAppStore();

  return (
    <div className="w-full space-y-2">
      <div className="space-y-0.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-[#0038FF]">
              light_mode
            </span>
            Kecerahan
          </span>
          <span className="font-mono text-[11px] font-semibold tabular-nums text-slate-500">
            {brightness}%
          </span>
        </div>
        <Slider
          value={[brightness]}
          min={50}
          max={150}
          step={1}
          onValueChange={(val) =>
            setBrightness(Array.isArray(val) ? val[0] : (val as unknown as number))
          }
          className="cursor-pointer"
        />
      </div>

      <div className="space-y-0.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-[#0038FF]">
              contrast
            </span>
            Kontras
          </span>
          <span className="font-mono text-[11px] font-semibold tabular-nums text-slate-500">
            {contrast}%
          </span>
        </div>
        <Slider
          value={[contrast]}
          min={50}
          max={150}
          step={1}
          onValueChange={(val) =>
            setContrast(Array.isArray(val) ? val[0] : (val as unknown as number))
          }
          className="cursor-pointer"
        />
      </div>

      <div className="space-y-0.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-[#0038FF]">
              palette
            </span>
            Saturasi
          </span>
          <span className="font-mono text-[11px] font-semibold tabular-nums text-slate-500">
            {saturation}%
          </span>
        </div>
        <Slider
          value={[saturation]}
          min={0}
          max={200}
          step={1}
          onValueChange={(val) =>
            setSaturation(Array.isArray(val) ? val[0] : (val as unknown as number))
          }
          className="cursor-pointer"
        />
      </div>
    </div>
  );
}
