export const PRINT_4R = {
  paperSize: "4R",
  widthMm: 101.6,
  heightMm: 152.4,
  widthPx: 1200,
  heightPx: 1800,
  dpi: 300,
} as const;

export type PrintLayout = "single" | "twin";

/** Fit the complete frame into a 4R sheet, preserving its aspect ratio. */
export function get4RPlacements(width: number, height: number, layout: PrintLayout) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error("Ukuran foto tidak valid untuk dicetak.");
  }
  const columns = layout === "twin" && width / height < 0.65 ? 2 : 1;
  const cellWidth = PRINT_4R.widthPx / columns;
  const scale = Math.min(cellWidth / width, PRINT_4R.heightPx / height);
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  return Array.from({ length: columns }, (_, column) => ({
    x: column * cellWidth + (cellWidth - drawWidth) / 2,
    y: (PRINT_4R.heightPx - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  }));
}

/** The same 1200 × 1800 raster is used by preview, browser print and bridge. */
export async function prepare4RPrint(source: string, layout: PrintLayout) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const loaded = new Image();
    loaded.crossOrigin = "anonymous";
    loaded.onload = () => resolve(loaded);
    loaded.onerror = () => reject(new Error("Foto gagal dimuat untuk cetak 4R."));
    loaded.src = source;
  });
  const placements = get4RPlacements(image.naturalWidth, image.naturalHeight, layout);
  const canvas = document.createElement("canvas");
  canvas.width = PRINT_4R.widthPx;
  canvas.height = PRINT_4R.heightPx;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Browser tidak dapat menyiapkan cetak 4R.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  for (const placement of placements) {
    context.drawImage(image, placement.x, placement.y, placement.width, placement.height);
  }
  return {
    imageDataUrl: canvas.toDataURL("image/png"),
    isStrip: image.naturalWidth / image.naturalHeight < 0.65,
  };
}
