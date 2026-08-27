"use client";

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getFramePreviewUrl } from '@/lib/frameMeta';

export function FrameSelector() {
  const { selectedFrameId, setSelectedFrameId, frames, isLoadingFrames, setCurrentStep } = useAppStore();

  if (isLoadingFrames) {
    return <div className="p-4 text-center font-tech-mono uppercase text-neon-yellow animate-pulse">LOADING_FRAMES_SYS...</div>;
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
              <div className={`w-full h-full bg-surface-container border-border-thick transition-all pixel-corners ${isSelected ? 'border-neon-yellow grayscale-0 shadow-[0_0_15px_rgba(223,255,0,0.5)]' : 'border-ink-black grayscale hover:grayscale-0'}`}>
                <div className="pixel-corners-inner"></div>
                {previewUrl ? (
                  <img src={previewUrl} alt={frame.name} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover z-10" />
                ) : frame.cssPlaceholder !== 'border-0' ? (
                  <div className={`absolute inset-0 z-10 ${frame.cssPlaceholder}`} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-on-surface-variant font-tech-mono">NO_PREVIEW</span>
                  </div>
                )}
                
                <div className={`absolute inset-0 border-[8px] flex items-center justify-center z-20 ${isSelected ? 'border-neon-yellow/20' : 'border-ink-black/80'}`}>
                  <span className={`px-2 py-1 font-tech-mono text-[10px] font-bold border border-ink-black text-xs transform -rotate-3 truncate max-w-[90%] uppercase ${isSelected ? 'bg-neon-yellow text-ink-black' : 'bg-stark-white text-ink-black'}`}>
                    {frame.name}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t-border-thick border-ink-black flex justify-center">
        <button 
          onClick={() => setCurrentStep('frame-selection')}
          className="text-stark-white font-tech-mono text-[10px] hover:text-neon-yellow transition-colors flex items-center gap-1 uppercase bg-ink-black px-3 py-2 border border-ink-black hard-shadow-sm jiggle-active"
        >
          VIEW_ALL_FRAMES
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
