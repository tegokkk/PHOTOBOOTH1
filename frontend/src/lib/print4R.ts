export const PRINT_4R = {
  paperSize: "4R",
  widthMm: 101.6,
  heightMm: 152.4,
  widthPx: 1200,
  heightPx: 1800,
  dpi: 300,
} as const;

export type PrintLayout = "single" | "twin";
export type PrintFitMode = "cover" | "contain";

/** Place a frame into 4R cells ("contain" keeps entire frame; "cover" fills 100% of 4R). */
export function get4RPlacements(
  width: number,
  height: number,
  layout: PrintLayout,
  fitMode: PrintFitMode = "contain"
) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error("Ukuran foto tidak valid untuk dicetak.");
  }
  const columns = layout === "twin" && width / height < 0.65 ? 2 : 1;
  const cellWidth = PRINT_4R.widthPx / columns;
  const scale =
    fitMode === "cover"
      ? Math.max(cellWidth / width, PRINT_4R.heightPx / height)
      : Math.min(cellWidth / width, PRINT_4R.heightPx / height);
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
export async function prepare4RPrint(
  source: string,
  layout: PrintLayout,
  fitMode: PrintFitMode = "contain"
) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const loaded = new Image();
    loaded.crossOrigin = "anonymous";
    loaded.onload = () => resolve(loaded);
    loaded.onerror = () => reject(new Error("Foto gagal dimuat untuk cetak 4R."));
    loaded.src = source;
  });
  const placements = get4RPlacements(
    image.naturalWidth,
    image.naturalHeight,
    layout,
    fitMode
  );
  const cellWidth = PRINT_4R.widthPx / placements.length;
  const canvas = document.createElement("canvas");
  canvas.width = PRINT_4R.widthPx;
  canvas.height = PRINT_4R.heightPx;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Browser tidak dapat menyiapkan cetak 4R.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  placements.forEach((placement, column) => {
    context.save();
    context.beginPath();
    context.rect(column * cellWidth, 0, cellWidth, PRINT_4R.heightPx);
    context.clip();
    context.drawImage(image, placement.x, placement.y, placement.width, placement.height);
    context.restore();
  });
  return {
    imageDataUrl: canvas.toDataURL("image/png"),
    isStrip: image.naturalWidth / image.naturalHeight < 0.65,
  };
}
