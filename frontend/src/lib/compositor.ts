import { FrameData } from '@/store/useAppStore';
import { getFrameMasterUrl, getFrameMetaFromFrame, PhotoSlot } from './frameMeta';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Load an image URL (data: or http:) into an HTMLImageElement. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

type DrawablePhoto = HTMLImageElement | HTMLCanvasElement;

function getDrawableSize(photo: DrawablePhoto) {
  if (photo instanceof HTMLCanvasElement) {
    return { width: photo.width, height: photo.height };
  }
  return {
    width: photo.naturalWidth || photo.width,
    height: photo.naturalHeight || photo.height,
  };
}

/**
 * Apply a subtle 5-tap unsharp mask to webcam captures so hair, eyes, and
 * details look sharper when composited onto high-DPI frames.
 */
function sharpenPhoto(photo: HTMLImageElement, strength = 0.24): DrawablePhoto {
  const width = photo.naturalWidth || photo.width;
  const height = photo.naturalHeight || photo.height;
  if (width < 4 || height < 4 || strength <= 0) return photo;

  try {
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return photo;

    ctx.drawImage(photo, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const src = imageData.data;
    const out = new Uint8ClampedArray(src.length);
    const centerWeight = 1 + 4 * strength;
    const rowStride = width * 4;

    // Preserve 1px outer border unchanged
    out.set(src.subarray(0, rowStride), 0);
    out.set(src.subarray((height - 1) * rowStride), (height - 1) * rowStride);

    for (let y = 1; y < height - 1; y++) {
      const rowOffset = y * rowStride;
      // Copy left/right edge pixels
      out[rowOffset] = src[rowOffset];
      out[rowOffset + 1] = src[rowOffset + 1];
      out[rowOffset + 2] = src[rowOffset + 2];
      out[rowOffset + 3] = src[rowOffset + 3];

      const lastCol = rowOffset + rowStride - 4;
      out[lastCol] = src[lastCol];
      out[lastCol + 1] = src[lastCol + 1];
      out[lastCol + 2] = src[lastCol + 2];
      out[lastCol + 3] = src[lastCol + 3];

      for (let x = 1; x < width - 1; x++) {
        const i = rowOffset + x * 4;
        const up = i - rowStride;
        const down = i + rowStride;
        const left = i - 4;
        const right = i + 4;

        out[i] = src[i] * centerWeight - strength * (src[up] + src[down] + src[left] + src[right]);
        out[i + 1] = src[i + 1] * centerWeight - strength * (src[up + 1] + src[down + 1] + src[left + 1] + src[right + 1]);
        out[i + 2] = src[i + 2] * centerWeight - strength * (src[up + 2] + src[down + 2] + src[left + 2] + src[right + 2]);
        out[i + 3] = src[i + 3];
      }
    }

    imageData.data.set(out);
    ctx.putImageData(imageData, 0, 0);
    return offscreen;
  } catch {
    return photo;
  }
}

function encodeCompositeDataUrl(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpg'
): string {
  if (format === 'png') {
    return canvas.toDataURL('image/png', 1.0);
  }

  // Try highest JPEG clarity first; step down only if payload nears serverless body limits.
  const maxSafeLength = 4_200_000;
  for (const quality of [0.97, 0.93, 0.88]) {
    const encoded = canvas.toDataURL('image/jpeg', quality);
    if (encoded.length <= maxSafeLength || quality === 0.88) {
      return encoded;
    }
  }
  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Draw a photo into a rectangular slot using object-fit: cover semantics.
 * Captured photos are drawn in their natural orientation.
 */
function drawPhotoIntoSlot(
  ctx: CanvasRenderingContext2D,
  photo: DrawablePhoto,
  slotX: number,   // pixels
  slotY: number,
  slotW: number,
  slotH: number,
  filters: { brightness: number; contrast: number; saturation: number },
  rotation = 0
) {
  const { brightness, contrast, saturation } = filters;
  const { width, height } = getDrawableSize(photo);

  // object-fit: cover
  const photoRatio = width / height;
  const slotRatio = slotW / slotH;
  let drawW = slotW;
  let drawH = slotH;
  let drawX = slotX;
  let drawY = slotY;

  if (photoRatio > slotRatio) {
    drawW = slotH * photoRatio;
    drawX = slotX - (drawW - slotW) / 2;
  } else {
    drawH = slotW / photoRatio;
    drawY = slotY - (drawH - slotH) / 2;
  }

  // Rotate and clip in the same local slot coordinates used by the preview.
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.translate(slotX + slotW / 2, slotY + slotH / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-(slotX + slotW / 2), -(slotY + slotH / 2));
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  ctx.beginPath();
  ctx.rect(slotX, slotY, slotW, slotH);
  ctx.clip();

  ctx.drawImage(photo, drawX, drawY, drawW, drawH);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// compositeToDataUrl
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Composites one or more user photos into the correct slots of the frame,
 * then overlays the frame PNG on top.
 *
 * @param photoUrls  Array of data URLs (one per slot for multi-slot frames,
 *                   or a single element for single-slot frames).
 * @param frame      The FrameData from the store (may be null).
 * @param brightness/contrast/saturation  CSS filter values (default 100).
 * @param format     'png' | 'jpg'
 */
export async function compositeToDataUrl(
  photoUrls: string | string[],
  frame: FrameData | null,
  brightness = 100,
  contrast = 100,
  saturation = 100,
  format: 'png' | 'jpg' = 'png'
): Promise<string> {
  const photos = Array.isArray(photoUrls) ? photoUrls : [photoUrls];
  const filters = { brightness, contrast, saturation };

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2D canvas context');

  // ── Case 1: No frame → single photo fills canvas at HD resolution ──────────
  if (!frame || !getFrameMasterUrl(frame)) {
    const rawPhoto = await loadImage(photos[0]);
    const enhanced = sharpenPhoto(rawPhoto);
    const { width, height } = getDrawableSize(enhanced);
    const minHeight = 2400;
    const scale = height < minHeight ? minHeight / height : 1;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    drawPhotoIntoSlot(ctx, enhanced, 0, 0, canvas.width, canvas.height, filters);

    return encodeCompositeDataUrl(canvas, format);
  }

  // ── Load frame PNG ──────────────────────────────────────────────────────────
  // Build correct URL (frames are served from /public/frames/... → /frames/...)
  const frameImg = await loadImage(getFrameMasterUrl(frame));

  // Target ultra-HD resolution (3600px+ height, ~600 DPI on 4R) while capping max dimension
  // at 4800px so frame artwork, typography, and photos stay sharp without exhausting mobile RAM.
  const minTargetHeight = 3600;
  const maxTargetDimension = 4800;
  let scale = 1;

  const maxNatural = Math.max(frameImg.naturalWidth, frameImg.naturalHeight);
  if (frameImg.naturalHeight < minTargetHeight) {
    scale = minTargetHeight / frameImg.naturalHeight;
  }
  if (maxNatural * scale > maxTargetDimension) {
    scale = maxTargetDimension / maxNatural;
  }

  canvas.width = Math.round(frameImg.naturalWidth * scale);
  canvas.height = Math.round(frameImg.naturalHeight * scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Cache sharpened photos by source URL so repeated slots only sharpen once
  const sharpenedCache = new Map<string, DrawablePhoto>();
  const loadAndSharpen = async (url: string): Promise<DrawablePhoto> => {
    const cached = sharpenedCache.get(url);
    if (cached) return cached;
    const img = await loadImage(url);
    const crisp = sharpenPhoto(img);
    sharpenedCache.set(url, crisp);
    return crisp;
  };

  // ── Case 2: Frame with slot metadata (multi or single slot) ────────────────
  const meta = getFrameMetaFromFrame(frame);

  if (meta && meta.slots.length > 0) {
    // Clear to white (most frames have white/coloured background)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Preload & sharpen all photos concurrently
    const loadedPhotos = await Promise.all(
      meta.slots.map(async (_, i) => {
        const photoUrl = photos[Math.min(i, photos.length - 1)]; // fallback to last photo
        return loadAndSharpen(photoUrl);
      })
    );

    // 2. Draw each photo into its corresponding slot (BEHIND THE FRAME)
    for (let i = 0; i < meta.slots.length; i++) {
      const slot: PhotoSlot = meta.slots[i];
      const photo = loadedPhotos[i];

      const slotX = slot.x * canvas.width;
      const slotY = slot.y * canvas.height;
      const slotW = slot.width * canvas.width;
      const slotH = slot.height * canvas.height;

      // Make sure we save and restore state inside drawPhotoIntoSlot so we don't clip the rest of the photos
      drawPhotoIntoSlot(ctx, photo, slotX, slotY, slotW, slotH, filters, slot.rotation || 0);
    }

    // 3. Draw frame PNG ON TOP (This requires the frame to have transparent holes!)
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  } else {
    // ── Case 3: Frame with imageUrl but NO slot metadata ─────────────────────
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Photo fills the full canvas (BEHIND)
    const photo = await loadAndSharpen(photos[0]);
    drawPhotoIntoSlot(ctx, photo, 0, 0, canvas.width, canvas.height, filters);

    // Draw frame ON TOP
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  return encodeCompositeDataUrl(canvas, format);
}

// ─────────────────────────────────────────────────────────────────────────────
// compositeAndDownload
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Composites and triggers a browser download.
 * Returns the dataUrl for optional backend upload.
 */
export async function compositeAndDownload(
  photoUrls: string | string[],
  frame: FrameData | null,
  brightness: number,
  contrast: number,
  saturation: number,
  format: 'png' | 'jpg' = 'png'
): Promise<string> {
  const dataUrl = await compositeToDataUrl(
    photoUrls, frame, brightness, contrast, saturation, format
  );

  const ext = format === 'jpg' ? 'jpg' : 'png';
  const link = document.createElement('a');
  link.download = `photobooth_${Date.now()}.${ext}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return dataUrl;
}
