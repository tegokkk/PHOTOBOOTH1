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

/**
 * Draw a photo into a rectangular slot using object-fit: cover semantics.
 * Captured photos are drawn in their natural orientation.
 */
function drawPhotoIntoSlot(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  slotX: number,   // pixels
  slotY: number,
  slotW: number,
  slotH: number,
  filters: { brightness: number; contrast: number; saturation: number },
  rotation = 0
) {
  const { brightness, contrast, saturation } = filters;

  // object-fit: cover
  const photoRatio = photo.width / photo.height;
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

  // ── Case 1: No frame → single photo fills canvas ───────────────────────────
  if (!frame || !getFrameMasterUrl(frame)) {
    const photo = await loadImage(photos[0]);
    canvas.width = photo.width;
    canvas.height = photo.height;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    drawPhotoIntoSlot(ctx, photo, 0, 0, canvas.width, canvas.height, filters);

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    return canvas.toDataURL(mimeType, format === 'jpg' ? 0.98 : 1.0);
  }

  // ── Load frame PNG ──────────────────────────────────────────────────────────
  // Build correct URL (frames are served from /public/frames/... → /frames/...)
  const frameImg = await loadImage(getFrameMasterUrl(frame));

  // Ensure high resolution canvas so frame edges and photos are never blurred or downsampled
  const minTargetHeight = 2400;
  const scale = frameImg.naturalHeight < minTargetHeight
    ? Math.max(1, Math.ceil(minTargetHeight / frameImg.naturalHeight))
    : 1;

  canvas.width = Math.round(frameImg.naturalWidth * scale);
  canvas.height = Math.round(frameImg.naturalHeight * scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // ── Case 2: Frame with slot metadata (multi or single slot) ────────────────
  const meta = getFrameMetaFromFrame(frame);

  if (meta && meta.slots.length > 0) {
    // Clear to white (most frames have white/coloured background)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Preload all photos concurrently
    const loadedPhotos = await Promise.all(
      meta.slots.map(async (_, i) => {
        const photoUrl = photos[Math.min(i, photos.length - 1)]; // fallback to last photo
        return loadImage(photoUrl);
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
    const photo = await loadImage(photos[0]);
    drawPhotoIntoSlot(ctx, photo, 0, 0, canvas.width, canvas.height, filters);

    // Draw frame ON TOP
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
  return canvas.toDataURL(mimeType, format === 'jpg' ? 0.98 : 1.0);
}
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
