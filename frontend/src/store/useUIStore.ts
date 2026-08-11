import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface UIState {
  // ── Toast notifications ──────────────────────────────────
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;

  // ── Loading state ─────────────────────────────────────────
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;

  // ── Modal state ───────────────────────────────────────────
  openModals: string[];
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  isModalOpen: (id: string) => boolean;
}

export const useUIStore = create<UIState>((set, get) => ({
  // ── Toast notifications ────────────────────────────────────
  toasts: [],
  showToast: (message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    // Auto-dismiss after 3.5 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 3500);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  // ── Loading state ──────────────────────────────────────────
  isLoading: false,
  setIsLoading: (val) => set({ isLoading: val }),

  // ── Modal state ────────────────────────────────────────────
  openModals: [],
  openModal: (id) =>
    set((state) => ({
      openModals: state.openModals.includes(id)
        ? state.openModals
        : [...state.openModals, id],
    })),
  closeModal: (id) =>
    set((state) => ({
      openModals: state.openModals.filter((m) => m !== id),
    })),
  isModalOpen: (id) => get().openModals.includes(id),
}));
