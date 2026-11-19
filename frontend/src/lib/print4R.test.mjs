import test from "node:test";
import assert from "node:assert/strict";
import { PRINT_4R, get4RPlacements } from "./print4R.ts";

test("4R is 4 by 6 inches at 300 DPI", () => {
  assert.equal(PRINT_4R.widthPx, 4 * PRINT_4R.dpi);
  assert.equal(PRINT_4R.heightPx, 6 * PRINT_4R.dpi);
  assert.ok(Math.abs(PRINT_4R.widthMm - 4 * 25.4) < 1e-9);
  assert.ok(Math.abs(PRINT_4R.heightMm - 6 * 25.4) < 1e-9);
});

for (const [name, width, height] of [
  ["portrait 4R", 1200, 1800], ["strip", 600, 1800],
  ["square", 1800, 1800], ["landscape", 2400, 1200],
  ["very tall strip", 400, 4000], ["large master", 5000, 8000],
]) {
  test(`${name} fits entirely into 4R without distortion or clipping`, () => {
    for (const layout of ["single", "twin"]) {
      const placements = get4RPlacements(width, height, layout);
      for (const rect of placements) {
        assert.ok(rect.x >= 0 && rect.y >= 0);
        assert.ok(rect.x + rect.width <= PRINT_4R.widthPx + 1e-9);
        assert.ok(rect.y + rect.height <= PRINT_4R.heightPx + 1e-9);
        assert.ok(Math.abs(rect.width / rect.height - width / height) < 1e-9);
      }
      if (placements.length === 2) {
        assert.ok(placements[0].x + placements[0].width <= placements[1].x + 1e-9);
      }
    }
  });
}

test("two 2 by 6 strips fill one 4R sheet", () => {
  assert.deepEqual(get4RPlacements(600, 1800, "twin"), [
    { x: 0, y: 0, width: 600, height: 1800 },
    { x: 600, y: 0, width: 600, height: 1800 },
  ]);
});

test("non-strip frames stay single even if twin was previously selected", () => {
  assert.equal(get4RPlacements(1200, 1800, "twin").length, 1);
});

test("invalid dimensions are rejected", () => {
  for (const [width, height] of [[0, 100], [100, 0], [-1, 10], [NaN, 10], [10, Infinity]]) {
    assert.throws(() => get4RPlacements(width, height, "single"));
  }
});

test("cover mode fills 100% of each 4R cell without distortion for all frame ratios", () => {
  for (const [width, height, layout] of [
    [2169, 3072, "single"], // Pointer Newspaper
    [1728, 3072, "single"], // Innovation 4 Force
    [2046, 3072, "single"], // Cinema Premiere / Jejak Kebersamaan
    [1800, 1800, "single"], // Square
    [600, 1800, "twin"],    // Twin 2x6 strips
  ]) {
    const placements = get4RPlacements(width, height, layout, "cover");
    const cellWidth = PRINT_4R.widthPx / placements.length;
    placements.forEach((rect, column) => {
      assert.ok(rect.width >= cellWidth - 1e-9);
      assert.ok(rect.height >= PRINT_4R.heightPx - 1e-9);
      assert.ok(Math.abs(rect.width / rect.height - width / height) < 1e-9);
      const expectedX = column * cellWidth + (cellWidth - rect.width) / 2;
      const expectedY = (PRINT_4R.heightPx - rect.height) / 2;
      assert.ok(Math.abs(rect.x - expectedX) < 1e-9);
      assert.ok(Math.abs(rect.y - expectedY) < 1e-9);
    });
  }
});
