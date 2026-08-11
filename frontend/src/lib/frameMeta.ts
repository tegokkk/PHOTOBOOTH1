import { useAppStore } from '../store/useAppStore';

export interface PhotoSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameMeta {
  imageUrlBasename: string;
  photoCount: number;
  slots: PhotoSlot[];
}

/**
 * Mengambil metadata slot berdasarkan frame imageUrl.
 * Data slots kini berasal dari database via API (tersimpan di zustand store).
 */
export function getFrameMeta(imageUrl: string): FrameMeta | null {
  if (!imageUrl) return null;
  const parts = imageUrl.split('/');
  const basename = parts[parts.length - 1];
  const decoded = decodeURIComponent(basename);

  const frames = useAppStore.getState().frames;
  // Cari berdasarkan basename atau full url
  const frame = frames.find(f => {
    const fParts = f.imageUrl.split('/');
    const fBasename = decodeURIComponent(fParts[fParts.length - 1]);
    return fBasename === decoded;
  });

  if (!frame) return null;

  return {
    imageUrlBasename: decoded,
    photoCount: frame.slots ? frame.slots.length : 1,
    slots: frame.slots || []
  };
}

/**
 * Apakah frame ini memerlukan lebih dari 1 foto?
 */
export function isMultiSlotFrame(imageUrl: string): boolean {
  const meta = getFrameMeta(imageUrl);
  return meta !== null && meta.photoCount > 1;
}

/**
 * Berapa jumlah foto yang dibutuhkan untuk sebuah frame?
 */
export function getPhotoCount(imageUrl: string): number {
  const meta = getFrameMeta(imageUrl);
  return meta?.photoCount || 1;
}
