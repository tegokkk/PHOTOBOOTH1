import { useAppStore, FrameData } from '../store/useAppStore';

export interface PhotoSlot {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
}

export interface FrameMeta {
  imageUrlBasename: string;
  photoCount: number;
  slots: PhotoSlot[];
}

export function getFramePreviewUrl(frame: FrameData): string {
  return frame.previewImageUrl || frame.imageUrl || '';
}

export function getFrameMasterUrl(frame: FrameData): string {
  return frame.masterImageUrl || getFramePreviewUrl(frame);
}

function getResourceBasename(resource: string): string {
  const withoutQuery = resource.split(/[?#]/, 1)[0];
  const basename = withoutQuery.split('/').pop() || '';
  try {
    return decodeURIComponent(basename);
  } catch {
    return basename;
  }
}

function frameMatchesImage(frame: FrameData, imageUrl: string): boolean {
  const requested = getResourceBasename(imageUrl);
  return [frame.imageUrl, frame.previewImageUrl, frame.masterImageUrl]
    .filter((url): url is string => Boolean(url))
    .some((url) => getResourceBasename(url) === requested);
}

export function getFrameMetaFromFrame(frame: FrameData | null): FrameMeta | null {
  if (!frame) return null;

  return {
    imageUrlBasename: getResourceBasename(getFramePreviewUrl(frame)),
    photoCount: frame.slots?.length || 1,
    slots: frame.slots || [],
  };
}

/**
 * Mengambil metadata slot berdasarkan frame imageUrl.
 * Data slots kini berasal dari database via API (tersimpan di zustand store).
 */
export function getFrameMeta(imageUrl: string): FrameMeta | null {
  if (!imageUrl) return null;

  const frames = useAppStore.getState().frames;
  const frame = frames.find((candidate) => frameMatchesImage(candidate, imageUrl));
  return getFrameMetaFromFrame(frame || null);
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
