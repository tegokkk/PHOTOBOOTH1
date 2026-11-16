import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_URL } from "@/lib/api";
import { useUIStore } from "@/store/useUIStore";

export interface FrameSlotData {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
}

export interface FrameData {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  previewImageUrl?: string | null;
  masterImageUrl?: string | null;
  width?: number | null;
  height?: number | null;
  cssPlaceholder: string;
  slots: FrameSlotData[];
}

export type AppStep = 'landing' | 'frame-selection' | 'camera' | 'review' | 'preview';


interface AppState {
  // ── Step / flow ─────────────────────────────────────────
  currentStep: AppStep;
  setCurrentStep: (step: AppStep) => void;
  isSessionOpen: boolean;
  openSession: () => void;
  closeSession: () => void;

  // ── Captured photos ───────────────────────────────────────
  // Array: one dataUrl per slot (multi-slot frames) or one element
  capturedPhotos: string[];
  setCapturedPhotos: (photos: string[]) => void;
  capturedPhotoMirrors: boolean[];
  addCapturedPhoto: (photo: string, mirrored?: boolean) => void;
  clearPhotos: () => void;

  /** Convenience: the latest / only photo (for single-slot frames) */
  capturedImage: string | null;
  setCapturedImage: (image: string | null) => void;

  // ── Camera state (multi-shot tracking) ───────────────────
  currentPhotoIndex: number;      // which slot we're capturing for
  totalPhotosNeeded: number;      // how many shots needed for current frame
  setPhotoSession: (total: number) => void;
  advancePhotoIndex: () => void;
  setPhotoIndex: (index: number) => void;
  resetPhotoSession: () => void;
  retakeQueue: number[];
  startRetake: (indices: number[]) => void;
  cancelRetake: () => void;
  completePhotoCapture: (photo: string, mirrored?: boolean) => void;
  resetSession: () => void;

  // ── Frame data ───────────────────────────────────────────
  selectedFrameId: string | null;
  setSelectedFrameId: (id: string | null) => void;
  frames: FrameData[];
  isLoadingFrames: boolean;
  frameLoadError: string | null;
  fetchFrames: () => Promise<void>;

  // ── Editor values ────────────────────────────────────────
  brightness: number;
  setBrightness: (val: number) => void;
  contrast: number;
  setContrast: (val: number) => void;
  saturation: number;
  setSaturation: (val: number) => void;
  resetEdits: () => void;
  timerDuration: 3 | 5 | 10;
  setTimerDuration: (sec: 3 | 5 | 10) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Step / flow ───────────────────────────────────────
      currentStep: 'landing',
      setCurrentStep: (step) => set({ currentStep: step }),
      isSessionOpen: false,
      openSession: () => set({ isSessionOpen: true, currentStep: 'frame-selection' }),
      closeSession: () => set({ isSessionOpen: false, currentStep: 'landing' }),

      // ── Captured photos ─────────────────────────────────────
      capturedPhotos: [],
      setCapturedPhotos: (photos) => set({
        capturedPhotos: photos,
        capturedPhotoMirrors: photos.map(() => false),
        capturedImage: photos.length > 0 ? photos[photos.length - 1] : null,
      }),
      capturedPhotoMirrors: [],
      addCapturedPhoto: (photo, mirrored = false) => {
        const state = get();
        const currentIndex = state.currentPhotoIndex;
        const photos = [...state.capturedPhotos];
        const mirrors = [...state.capturedPhotoMirrors];
        photos[currentIndex] = photo;
        mirrors[currentIndex] = mirrored;
        set({ capturedPhotos: photos, capturedPhotoMirrors: mirrors, capturedImage: photo });
      },
      clearPhotos: () => set({ capturedPhotos: [], capturedPhotoMirrors: [], capturedImage: null, currentPhotoIndex: 0, retakeQueue: [] }),

      capturedImage: null,
      setCapturedImage: (image) => set({
        capturedImage: image,
        capturedPhotos: image ? [image] : [],
        capturedPhotoMirrors: image ? [false] : [],
      }),

      // ── Multi-shot session ───────────────────────────────────
      currentPhotoIndex: 0,
      totalPhotosNeeded: 1,
      setPhotoSession: (total) => set({ totalPhotosNeeded: total, currentPhotoIndex: 0, retakeQueue: [] }),
      advancePhotoIndex: () => set((state) => {
        // Find next empty slot or just advance
        let nextIndex = state.currentPhotoIndex + 1;
        while (nextIndex < state.totalPhotosNeeded && state.capturedPhotos[nextIndex]) {
           nextIndex++;
        }
        return { currentPhotoIndex: nextIndex };
      }),
      setPhotoIndex: (index: number) => set({ currentPhotoIndex: index }),
      resetPhotoSession: () => set({ currentPhotoIndex: 0, retakeQueue: [] }),
      retakeQueue: [],
      startRetake: (indices) => {
        const state = get();
        if (!state.isSessionOpen) return;
        const queue = [...new Set(indices)].filter((index) =>
          Number.isInteger(index) && index >= 0 && index < state.totalPhotosNeeded && Boolean(state.capturedPhotos[index])
        ).sort((a, b) => a - b);
        if (!queue.length) return;
        // Keep the original photos until each replacement is captured successfully.
        set({ retakeQueue: queue, currentPhotoIndex: queue[0], currentStep: 'camera' });
      },
      cancelRetake: () => set({ retakeQueue: [], currentStep: 'review' }),
      completePhotoCapture: (photo, mirrored = false) => {
        const state = get();
        const index = state.currentPhotoIndex;
        if (!state.isSessionOpen || state.currentStep !== 'camera' || !photo || !Number.isInteger(index) || index < 0 || index >= state.totalPhotosNeeded) return;
        const photos = [...state.capturedPhotos];
        const mirrors = [...state.capturedPhotoMirrors];
        photos[index] = photo;
        mirrors[index] = mirrored;
        const queue = state.retakeQueue.filter((target) => target !== index);
        const nextIndex = state.retakeQueue.length
          ? (queue[0] ?? -1)
          : Array.from({ length: state.totalPhotosNeeded }, (_, i) => i).find((i) => !photos[i]) ?? -1;
        set({
          capturedPhotos: photos,
          capturedPhotoMirrors: mirrors,
          capturedImage: photo,
          retakeQueue: queue,
          currentPhotoIndex: nextIndex === -1 ? index : nextIndex,
          currentStep: nextIndex === -1 ? 'review' : 'camera',
        });
      },
      resetSession: () => set({
        currentStep: 'landing',
        isSessionOpen: false,
        selectedFrameId: null,
        capturedPhotos: [],
        capturedPhotoMirrors: [],
        capturedImage: null,
        currentPhotoIndex: 0,
        totalPhotosNeeded: 1,
        retakeQueue: [],
        brightness: 100,
        contrast: 100,
        saturation: 100,
      }),

      // ── Frame data ─────────────────────────────────────────
      selectedFrameId: null,
      setSelectedFrameId: (id) => {
        const state = get();
        if (state.selectedFrameId !== id) {
          const oldFrame = state.frames.find(f => f.id === state.selectedFrameId);
          const newFrame = state.frames.find(f => f.id === id);

          const oldSlots = oldFrame?.slots?.length || 1;
          const newSlots = newFrame?.slots?.length || 1;

          if (oldSlots !== newSlots) {
             state.clearPhotos();
             state.resetPhotoSession();
             state.setPhotoSession(newSlots);
          }
        }
        set({ selectedFrameId: id, ...(state.selectedFrameId !== id ? { retakeQueue: [] } : {}) });
      },
      frames: [],
      isLoadingFrames: false,
      frameLoadError: null,
      fetchFrames: async () => {
        set({ isLoadingFrames: true, frameLoadError: null });
        try {
          const res = await fetch(`${API_URL}/api/frames`);
          if (!res.ok) {
            throw new Error(`HTTP error ${res.status}`);
          }
          const contentType = res.headers.get("content-type") || "";
          if (!contentType.includes("application/json")) {
            throw new Error(`Respon bukan JSON: ${contentType}`);
          }
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            set((state) => ({
              frames: data.data,
              isLoadingFrames: false,
              frameLoadError: null,
              selectedFrameId: state.selectedFrameId,
            }));
          } else {
            const message = "Daftar frame belum bisa dimuat. Coba lagi.";
            set({ frames: [], isLoadingFrames: false, frameLoadError: message });
            useUIStore.getState().showToast(message, "error");
          }
        } catch (error) {
          console.warn('Failed to fetch frames:', error);
          const message = "Server tidak dapat dihubungi. Periksa koneksi lalu coba lagi.";
          set({ frames: [], isLoadingFrames: false, frameLoadError: message });
          useUIStore.getState().showToast(message, "error");
        }
      },

      // ── Editor values ───────────────────────────────────────
      brightness: 100,
      setBrightness: (val) => set({ brightness: val }),
      contrast: 100,
      setContrast: (val) => set({ contrast: val }),
      saturation: 100,
      setSaturation: (val) => set({ saturation: val }),
      resetEdits: () => set({ brightness: 100, contrast: 100, saturation: 100 }),
      timerDuration: 3,
      setTimerDuration: (sec) => set({ timerDuration: sec }),
    }),
    {
      name: 'photobooth-storage',
      // Only persist user preferences — NOT photos (too large for localStorage)
      partialize: (state) => ({
        selectedFrameId: state.selectedFrameId,
        timerDuration: state.timerDuration,
        brightness: state.brightness,
        contrast: state.contrast,
        saturation: state.saturation,
      }),
    }
  )
);
