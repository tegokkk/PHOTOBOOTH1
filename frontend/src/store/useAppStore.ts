import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_URL } from "@/lib/api";
import { useUIStore } from "@/store/useUIStore";

export interface FrameSlotData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameData {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  cssPlaceholder: string;
  slots: FrameSlotData[];
}

export type AppStep = 'landing' | 'frame-selection' | 'camera' | 'preview';

interface AppState {
  // ── Step / flow ─────────────────────────────────────────
  currentStep: AppStep;
  setCurrentStep: (step: AppStep) => void;

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

  // ── Frame data ───────────────────────────────────────────
  selectedFrameId: string | null;
  setSelectedFrameId: (id: string | null) => void;
  frames: FrameData[];
  isLoadingFrames: boolean;
  fetchFrames: () => Promise<void>;

  // ── Editor values ────────────────────────────────────────
  brightness: number;
  setBrightness: (val: number) => void;
  contrast: number;
  setContrast: (val: number) => void;
  saturation: number;
  setSaturation: (val: number) => void;
  resetEdits: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Step / flow ───────────────────────────────────────
      currentStep: 'landing',
      setCurrentStep: (step) => set({ currentStep: step }),

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
      clearPhotos: () => set({ capturedPhotos: [], capturedPhotoMirrors: [], capturedImage: null, currentPhotoIndex: 0 }),

      capturedImage: null,
      setCapturedImage: (image) => set({
        capturedImage: image,
        capturedPhotos: image ? [image] : [],
        capturedPhotoMirrors: image ? [false] : [],
      }),

      // ── Multi-shot session ───────────────────────────────────
      currentPhotoIndex: 0,
      totalPhotosNeeded: 1,
      setPhotoSession: (total) => set({ totalPhotosNeeded: total, currentPhotoIndex: 0 }),
      advancePhotoIndex: () => set((state) => {
        // Find next empty slot or just advance
        let nextIndex = state.currentPhotoIndex + 1;
        while (nextIndex < state.totalPhotosNeeded && state.capturedPhotos[nextIndex]) {
           nextIndex++;
        }
        return { currentPhotoIndex: nextIndex };
      }),
      setPhotoIndex: (index: number) => set({ currentPhotoIndex: index }),
      resetPhotoSession: () => set({ currentPhotoIndex: 0 }),

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
        set({ selectedFrameId: id });
      },
      frames: [],
      isLoadingFrames: false,
      fetchFrames: async () => {
        set({ isLoadingFrames: true });
        try {
          const res = await fetch(`${API_URL}/api/frames`);
          const data = await res.json();
          if (data.success) {
            set((state) => ({
              frames: data.data,
              isLoadingFrames: false,
              selectedFrameId:
                state.selectedFrameId ||
                (data.data.length > 0 ? data.data[0].id : null),
            }));
          } else {
            set({ frames: [], isLoadingFrames: false });
            useUIStore.getState().showToast("Gagal memuat daftar frame dari server.", "error");
          }
        } catch (error) {
          console.error('Failed to fetch frames', error);
          set({ frames: [], isLoadingFrames: false });
          useUIStore.getState().showToast("Gagal terhubung ke server. Pastikan backend aktif.", "error");
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
    }),
    {
      name: 'photobooth-storage',
      // Only persist user preferences — NOT photos (too large for localStorage)
      partialize: (state) => ({
        selectedFrameId: state.selectedFrameId,
        brightness: state.brightness,
        contrast: state.contrast,
        saturation: state.saturation,
      }),
    }
  )
);
