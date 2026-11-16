import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = readFileSync(new URL("./useAppStore.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function makeSession(total = 4) {
  const exports = {};
  vm.runInNewContext(code, { exports, require(name) {
    if (name === "zustand/middleware") return { persist: (initializer) => initializer };
    if (name === "@/lib/api") return { API_URL: "http://test.invalid" };
    if (name === "@/store/useUIStore") return { useUIStore: {} };
    return require(name);
  } });
  const store = exports.useAppStore;
  store.getState().openSession();
  store.getState().setPhotoSession(total);
  store.getState().setCurrentStep("camera");
  return store;
}

function finishInitialPhotos(store, count = 4) {
  for (let i = 0; i < count; i++) store.getState().completePhotoCapture(`original-${i}`, i % 2 === 0);
}

test("all initial slots lead to review, never directly to printer preview", () => {
  for (const total of [1, 2, 4, 6]) {
    const store = makeSession(total);
    for (let i = 0; i < total; i++) {
      assert.equal(store.getState().currentPhotoIndex, i);
      store.getState().completePhotoCapture(`photo-${i}`);
      assert.equal(store.getState().currentStep, i === total - 1 ? "review" : "camera");
    }
  }
});

test("retake only replaces selected slots and waits for all selected targets", () => {
  const store = makeSession();
  finishInitialPhotos(store);
  store.getState().startRetake([3, 1, 1]);
  assert.equal(store.getState().currentPhotoIndex, 1);
  assert.deepEqual(Array.from(store.getState().capturedPhotos), ["original-0", "original-1", "original-2", "original-3"]);
  store.getState().completePhotoCapture("replacement-1", false);
  assert.equal(store.getState().currentStep, "camera");
  assert.equal(store.getState().currentPhotoIndex, 3);
  store.getState().completePhotoCapture("replacement-3", true);
  assert.equal(store.getState().currentStep, "review");
  assert.deepEqual(Array.from(store.getState().retakeQueue), []);
  assert.deepEqual(Array.from(store.getState().capturedPhotos), ["original-0", "replacement-1", "original-2", "replacement-3"]);
  assert.deepEqual(Array.from(store.getState().capturedPhotoMirrors), [true, false, true, true]);
});

test("cancelling retake keeps untouched photos and successful replacements", () => {
  const store = makeSession();
  finishInitialPhotos(store);
  store.getState().startRetake([0, 2]);
  store.getState().completePhotoCapture("replacement-0");
  store.getState().cancelRetake();
  assert.equal(store.getState().currentStep, "review");
  assert.deepEqual(Array.from(store.getState().capturedPhotos), ["replacement-0", "original-1", "original-2", "original-3"]);
});

test("invalid selections and failed captures do not lose photos", () => {
  const store = makeSession();
  finishInitialPhotos(store);
  store.getState().startRetake([-1, 4, 1.5, NaN]);
  assert.equal(store.getState().currentStep, "review");
  store.getState().startRetake([2]);
  store.getState().completePhotoCapture("");
  assert.equal(store.getState().currentPhotoIndex, 2);
  assert.equal(store.getState().capturedPhotos[2], "original-2");
});

test("retaking all slots and resetting a session clear the queue correctly", () => {
  const store = makeSession();
  finishInitialPhotos(store);
  store.getState().startRetake([0, 1, 2, 3]);
  for (let i = 0; i < 4; i++) store.getState().completePhotoCapture(`new-${i}`);
  assert.equal(store.getState().currentStep, "review");
  store.getState().startRetake([1]);
  store.getState().resetSession();
  store.getState().completePhotoCapture("late-capture");
  assert.equal(store.getState().currentStep, "landing");
  assert.equal(store.getState().isSessionOpen, false);
  assert.deepEqual(Array.from(store.getState().retakeQueue), []);
  assert.deepEqual(Array.from(store.getState().capturedPhotos), []);
});
