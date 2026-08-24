"use client";

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getFramePreviewUrl } from '@/lib/frameMeta';

export function FrameSelector() {
  const { selectedFrameId, setSelectedFrameId, frames, isLoadingFrames, setCurrentStep } = useAppStore();

  if (isLoadingFrames) {
    return <div className="p-4 text-center">Loading frames...</div>;
  }

  return (
    <div className="w-full mt-2">
      <div className="flex md:grid md:grid-cols-2 gap-4 overflow-x-auto md:overflow-visible no-scrollbar pb-4 md:pb-0 snap-x w-full">
        {frames.map((frame) => {
          const isSelected = selectedFrameId === frame.id;
          const previewUrl = getFramePreviewUrl(frame);
          return (
            <button 
              key={frame.id}
              onClick={() => setSelectedFrameId(frame.id)}
              className="snap-center shrink-0 w-32 h-40 md:w-full md:h-auto md:aspect-[3/4] relative group focus:outline-none hover:scale-105 transition-transform"
            >
              {/* Active Scribble Ring */}
              {isSelected && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none scale-110 z-10 text-curtain-red" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path className="animate-[dash_3s_ease-in-out_infinite]" d="M5,50 C5,10 95,10 95,50 C95,90 5,90 5,50 C5,20 85,20 85,50" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
                </svg>
              )}
              
              <div className={`w-full h-full bg-surface-container sketch-border-thin overflow-hidden relative transition-all ${isSelected ? 'grayscale-0' : 'grayscale hover:grayscale-0'}`}>
                {previewUrl ? (
                  <img src={previewUrl} alt={frame.name} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover z-10" />
                ) : frame.cssPlaceholder !== 'border-0' ? (
                  <div className={`absolute inset-0 z-10 ${frame.cssPlaceholder}`} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">Preview</span>
                  </div>
                )}
                
                <div className="absolute inset-0 border-[8px] border-surface-container-high/80 flex items-center justify-center">
                  <span className="bg-paper-white px-2 py-1 font-label-caps text-label-caps text-ink-black sketch-border-thin text-xs rotate-3 truncate max-w-[90%]">
                    {frame.name}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t-2 border-ink-black border-dashed flex justify-center">
        <button 
          onClick={() => setCurrentStep('frame-selection')}
          className="text-on-surface-variant font-label-caps text-label-caps hover:text-curtain-red transition-colors flex items-center gap-1 underline decoration-wavy underline-offset-4"
        >
          See All Frames
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
