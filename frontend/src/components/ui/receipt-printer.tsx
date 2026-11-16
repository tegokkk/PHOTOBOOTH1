/**
 * Receipt Printer. Designed & built by Aakash Mehra.
 *
 * A thermal printer seen from above, its paper slot facing up the screen. Press the red PRINT
 * button and the feed motor whirs while a receipt rises smoothly out of the slot, header first.
 * The paper is one continuous strip: press PRINT mid-print and it stops where it is; press it again
 * (or after it finishes) and a whole new receipt prints on, joined to what's already out. Pull the
 * strip (up or sideways) and it tears off along a zigzag edge and flies away.
 *
 * Every size is a multiple of --u, so the whole thing scales with the viewport. Sounds are
 * synthesized with WebAudio, so there are no asset files.
 */
"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  MotionConfig,
  animate,
  motion,
  motionValue,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReceiptItem = { name: string; qty: number; price: number };

export type ReceiptPrinterProps = {
  store?: string;
  address?: string;
  items?: ReceiptItem[];
  currency?: string;
  /** 0.1 = 10% */
  taxRate?: number;
  onPrint?: (order: number) => void;
  className?: string;
  /** Optional media/photo content rendered inside the printed receipt strip. */
  photoContent?: ReactNode;
  /** Automatically trigger printing on mount (and whenever autoPrintKey changes). */
  autoPrint?: boolean;
  /** Key used alongside autoPrint to re-trigger printing when the generated output changes. */
  autoPrintKey?: string;
  /** Fit cleanly inside an embedded container instead of occupying a full viewport. */
  embedded?: boolean;
  /** Render the printer on a transparent background without backdrop gradient or grain. */
  transparent?: boolean;
  /** Brand label embossed on the printer body. */
  makerMark?: string;
  /** Whether to display Subtotal / Tax / Total rows. */
  showPricing?: boolean;
  /** Render only the photoContent full-bleed without receipt header, items, or barcode. */
  photoOnly?: boolean;
  /** Optional custom formatter for the right-hand value of each item row. */
  itemValueFormatter?: (item: ReceiptItem, index: number) => string;
};

const ITEMS: ReceiptItem[] = [
  { name: "Cola", qty: 2, price: 100 },
  { name: "Melon soda", qty: 1, price: 90 },
  { name: "Peach", qty: 1, price: 120 },
  { name: "Rice crackers", qty: 1, price: 180 },
];

/** One design unit. The stage is 440 x 930 units. */
const u = (n: number) => `calc(var(--u) * ${n})`;
const W = 440;
const H = 930;
const SLOT_Y = 690; // where the paper comes out
const PAPER_W = 300;
const PAPER_X = (W - PAPER_W) / 2;

type Receipt = {
  id: number;
  order: number;
  date: string;
  frac: MotionValue<number>;
};
type Phase = "idle" | "printing" | "stopped";

export function ReceiptPrinter({
  store = "Fizz & Co.",
  address = "12 Harbor Street, Lisbon",
  items = ITEMS,
  currency = "¥",
  taxRate = 0.1,
  onPrint,
  className,
  photoContent,
  autoPrint = false,
  autoPrintKey,
  embedded = false,
  transparent = false,
  makerMark = "skyrmo",
  showPricing = true,
  photoOnly = false,
  itemValueFormatter,
}: ReceiptPrinterProps) {
  // The paper is one continuous strip: every print joins a new receipt onto the end of it.
  const [strip, setStrip] = useState([] as Receipt[]);
  const [flying, setFlying] = useState(
    null as null | {
      strip: Receipt[];
      x: number;
      y: number;
      vx: number;
      vy: number;
    },
  );
  const [phase, setPhase] = useState("idle" as Phase);
  const [pressed, setPressed] = useState(false);
  const [soundOff, setSoundOff] = useState(false);
  const order = useRef(426);
  const nextId = useRef(0);
  const feeding = useRef(null as null | { stop: () => void });

  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);
  const pullR = useTransform(pullX, (x) => x * 0.04);
  const drag = useRef(
    null as null | {
      x0: number;
      y0: number;
      lx: number;
      ly: number;
      lt: number;
      vx: number;
      vy: number;
    },
  );

  const lines = photoOnly
    ? 15
    : 16 + items.length + (photoContent ? 8 : 0); // roughly how long one receipt takes

  useEffect(() => () => feeding.current?.stop(), []);

  /** Print a whole new receipt onto the end of the strip. */
  const printOne = () => {
    sfx.unlock();
    order.current += 1;
    const r: Receipt = {
      id: nextId.current++,
      order: order.current,
      date: new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      frac: motionValue(0),
    };
    setStrip((s) => [...s, r]);
    setPhase("printing");
    onPrint?.(order.current);

    const dur = 0.9 + lines * 0.1;
    const stopSound = sfx.feed(dur);
    // a steady feed: it eases off the line for a beat, runs at an even speed, then stops
    const a = animate(r.frac, 1, { duration: dur, ease: [0.4, 0, 0.9, 1] });
    feeding.current = {
      stop: () => {
        a.stop();
        stopSound();
      },
    };
    a.then(() => {
      if (r.frac.get() < 0.999) return; // stopped early
      feeding.current = null;
      setPhase("stopped");
      sfx.done();
    });
  };

  const printOneRef = useRef(printOne);
  useEffect(() => {
    printOneRef.current = printOne;
  });

  useEffect(() => {
    if (!autoPrint) return;
    feeding.current?.stop();
    feeding.current = null;
    const timer = setTimeout(() => {
      printOneRef.current();
    }, 250);
    return () => {
      clearTimeout(timer);
      feeding.current?.stop();
      feeding.current = null;
    };
  }, [autoPrint, autoPrintKey]);

  const stopFeed = () => {
    feeding.current?.stop();
    feeding.current = null;
    setPhase("stopped");
  };

  /** Rip the whole strip off at the slot; it flies away with the given velocity. */
  const tear = (vx: number, vy: number) => {
    if (!strip.length) return;
    feeding.current?.stop();
    feeding.current = null;
    sfx.rip();
    setFlying({ strip, x: pullX.get(), y: pullY.get(), vx, vy });
    setStrip([]);
    setPhase("idle");
    pullX.set(0);
    pullY.set(0);
  };

  // PRINT: stops the feed if it's running, otherwise prints another receipt onto the strip.
  const print = () => {
    sfx.unlock();
    sfx.button();
    setPressed(true);
    setTimeout(() => setPressed(false), 140);
    if (phase === "printing") stopFeed();
    else setTimeout(printOne, 160);
  };

  /* Pulling the strip: it gives a little (it's still attached), then rips. */
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    sfx.unlock();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      x0: e.clientX,
      y0: e.clientY,
      lx: e.clientX,
      ly: e.clientY,
      lt: e.timeStamp,
      vx: 0,
      vy: 0,
    };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dt = Math.max(1, e.timeStamp - d.lt);
    d.vx = ((e.clientX - d.lx) / dt) * 1000;
    d.vy = ((e.clientY - d.ly) / dt) * 1000;
    d.lx = e.clientX;
    d.ly = e.clientY;
    d.lt = e.timeStamp;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    // stretch with resistance; pushing it back into the printer does nothing
    pullX.set(dx * 0.3);
    pullY.set(Math.min(0, dy) * 0.3);
    if (Math.hypot(dx, Math.min(0, dy)) > 80) {
      drag.current = null;
      tear(d.vx || dx * 8, Math.min(d.vy, -300));
    }
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    animate(pullX, 0, { type: "spring", stiffness: 500, damping: 22 });
    animate(pullY, 0, { type: "spring", stiffness: 500, damping: 22 });
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tear(0, -900);
    }
  };

  const total = items.reduce((t, i) => t + i.qty * i.price, 0);
  const tax = Math.round(total * taxRate);
  const paper: PaperProps = {
    store,
    address,
    items,
    currency,
    total,
    tax,
    taxRate,
    photoContent,
    showPricing,
    photoOnly,
    itemValueFormatter,
  };
  const hint = photoOnly
    ? phase === "printing"
      ? "Mencetak foto… klik PRINT untuk berhenti"
      : strip.length
        ? "Tarik foto untuk menyobek, atau klik PRINT lagi"
        : "Klik tombol PRINT untuk mencetak foto"
    : phase === "printing"
      ? "Printing… press print to stop"
      : strip.length
        ? "Pull to tear it off, or print another"
        : "Press print";

  const stageH = embedded ? 630 : H;
  const slotY = embedded ? 405 : SLOT_Y;
  const printerTop = slotY - 50;

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn(
          "relative grid w-full place-items-center font-sans text-[#2b2a27]",
          transparent ? "overflow-visible" : "overflow-hidden",
          embedded ? "px-1 pt-0 pb-1" : "min-h-dvh",
          className,
        )}
        style={
          {
            ...(embedded ? { containerType: "inline-size" } : {}),
            "--u": embedded
              ? transparent
                ? "min((100cqw - 12px) / 440, (100dvh - 165px) / 630, 1.32px)"
                : "min((100cqw - 16px) / 440, (100dvh - 170px) / 630, 1.15px)"
              : "min((100vw - 32px) / 440, (100dvh - 24px) / 930)",
            background: transparent
              ? "transparent"
              : embedded
                ? "radial-gradient(80% 70% at 50% 35%, #F8FAFC 0%, #EFF6FF 55%, #E2E8F0 100%)"
                : "radial-gradient(80% 70% at 50% 35%, #e9e6df 0%, #dcd8cf 55%, #cdc8bd 100%)",
          } as CSSProperties
        }
      >
        {!transparent && (
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply"
            style={{ backgroundImage: GRAIN }}
          />
        )}

        {!transparent && (
          <button
            type="button"
            onClick={() => {
              const next = !soundOff;
              setSoundOff(next);
              setMuted(next);
              if (!next) {
                sfx.unlock();
                sfx.button();
              }
            }}
            aria-label={soundOff ? "Turn sound on" : "Turn sound off"}
            aria-pressed={soundOff}
            className={cn(
              "absolute z-40 grid cursor-pointer place-items-center rounded-full bg-white/75 text-[#2b2a27] shadow-[0_1px_2px_rgb(0_0_0/0.08),0_6px_16px_-8px_rgb(0_0_0/0.3)] ring-1 ring-black/5 backdrop-blur transition-[transform,background-color] duration-200 hover:bg-white active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4231a]",
              embedded ? "top-2.5 right-2.5 size-10" : "right-4 bottom-4 size-11",
            )}
          >
            {soundOff ? (
              <VolumeX className={embedded ? "size-4" : "size-[18px]"} strokeWidth={2} />
            ) : (
              <Volume2 className={embedded ? "size-4" : "size-[18px]"} strokeWidth={2} />
            )}
          </button>
        )}

        <div className="relative" style={{ width: u(W), height: u(stageH) }}>
          {transparent && (
            <button
              type="button"
              onClick={() => {
                const next = !soundOff;
                setSoundOff(next);
                setMuted(next);
                if (!next) {
                  sfx.unlock();
                  sfx.button();
                }
              }}
              aria-label={soundOff ? "Turn sound on" : "Turn sound off"}
              aria-pressed={soundOff}
              style={{ right: u(12), top: u(printerTop - 52) }}
              className="absolute z-40 grid size-11 cursor-pointer place-items-center rounded-full bg-white/95 text-[#2b2a27] shadow-sm ring-1 ring-black/10 backdrop-blur transition-[transform,background-color] duration-200 hover:bg-white active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4231a]"
            >
              {soundOff ? (
                <VolumeX className="size-[18px]" strokeWidth={2} />
              ) : (
                <Volume2 className="size-[18px]" strokeWidth={2} />
              )}
            </button>
          )}
          {/* the strip, rising out of the slot; clipped at the slot so it comes from inside, free to run off the top */}
          <div
            className="pointer-events-none absolute z-10 overflow-hidden"
            style={{
              left: u(PAPER_X - 40),
              width: u(PAPER_W + 80),
              top: u(-3000),
              height: u(slotY + 3000),
            }}
          >
            {strip.length > 0 && (
              <motion.div
                role="button"
                tabIndex={0}
                aria-label="Receipt. Pull it, or press Enter, to tear it off."
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                onKeyDown={onKey}
                className="pointer-events-auto absolute bottom-0 cursor-grab touch-none outline-none focus-visible:ring-2 focus-visible:ring-[#d4231a]/60 active:cursor-grabbing"
                style={{
                  left: u(40),
                  width: u(PAPER_W),
                  x: pullX,
                  y: pullY,
                  rotate: pullR,
                  transformOrigin: "50% 100%",
                }}
              >
                <Strip strip={strip} paper={paper} />
              </motion.div>
            )}
          </div>

          {/* the strip that got torn off */}
          {flying && (
            <motion.div
              className="pointer-events-none absolute z-30"
              style={{
                left: u(PAPER_X),
                width: u(PAPER_W),
                bottom: u(stageH - slotY),
                transformOrigin: "50% 100%",
                WebkitMask: ZIGZAG_BOTTOM,
                mask: ZIGZAG_BOTTOM,
              }}
              initial={{
                x: flying.x,
                y: flying.y,
                rotate: flying.x * 0.04,
                opacity: 1,
              }}
              animate={{
                x: flying.x + flying.vx * 0.55,
                y: flying.y + flying.vy * 0.55 - 120,
                rotate:
                  flying.x * 0.04 +
                  flying.vx * 0.03 +
                  (flying.vx >= 0 ? 14 : -14),
                opacity: 0,
              }}
              transition={{
                duration: 0.85,
                ease: [0.2, 0.7, 0.3, 1],
                opacity: { duration: 0.85, ease: "easeIn" },
              }}
              onAnimationComplete={() => setFlying(null)}
            >
              <Strip strip={flying.strip} paper={paper} />
            </motion.div>
          )}

          {/* ---- the printer, from above ---- */}
          <div
            className="absolute"
            style={{ left: u(20), top: u(printerTop), width: u(400), height: u(240) }}
          >
            {/* body */}
            <div
              className="absolute inset-0"
              style={{
                borderRadius: u(40),
                background:
                  "linear-gradient(180deg, #f6f4ef 0%, #ebe8e1 55%, #dedad1 100%)",
                boxShadow: `inset 0 ${u(2)} ${u(1)} rgb(255 255 255 / 0.9), inset 0 ${u(-6)} ${u(10)} rgb(120 110 95 / 0.18), 0 ${u(2)} ${u(3)} rgb(60 50 40 / 0.18), ${u(10)} ${u(26)} ${u(40)} ${u(-8)} rgb(60 50 40 / 0.4)`,
              }}
            />
            {/* lid seam */}
            <div
              className="absolute"
              style={{
                left: u(24),
                right: u(24),
                top: u(92),
                height: u(2),
                borderRadius: u(2),
                background: "rgb(120 110 95 / 0.25)",
                boxShadow: `0 ${u(1)} 0 rgb(255 255 255 / 0.8)`,
              }}
            />
            {/* paper slot */}
            <div
              className="absolute"
              style={{
                left: u(PAPER_X - 20 - 18),
                width: u(PAPER_W + 36),
                top: u(slotY - printerTop - 7),
                height: u(14),
                borderRadius: u(7),
                background: "linear-gradient(180deg, #1b1a18, #3a3833)",
                boxShadow: `inset 0 ${u(2)} ${u(3)} rgb(0 0 0 / 0.8), 0 ${u(1)} 0 rgb(255 255 255 / 0.85)`,
              }}
            />
            {/* paper lip waiting in the slot */}
            {!strip.length && (
              <div
                className="absolute bg-[#fbfaf6]"
                style={{
                  left: u(PAPER_X - 20),
                  width: u(PAPER_W),
                  top: u(slotY - printerTop - 9),
                  height: u(9),
                  WebkitMask: ZIGZAG_TOP,
                  mask: ZIGZAG_TOP,
                }}
              />
            )}
            {/* status light */}
            <div
              className="absolute flex items-center"
              style={{ left: u(250), top: u(132), gap: u(8) }}
            >
              <motion.span
                className="block rounded-full"
                style={{ width: u(9), height: u(9) }}
                animate={
                  phase === "printing"
                    ? {
                        backgroundColor: ["#ffb340", "#7a5310", "#ffb340"],
                        boxShadow: [
                          `0 0 ${u(8)} #ffb340`,
                          "0 0 0px #ffb340",
                          `0 0 ${u(8)} #ffb340`,
                        ],
                      }
                    : {
                        backgroundColor: "#4fd27a",
                        boxShadow: `0 0 ${u(7)} rgb(79 210 122 / 0.8)`,
                      }
                }
                transition={
                  phase === "printing"
                    ? { duration: 0.5, repeat: Infinity }
                    : { duration: 0.3 }
                }
              />
            </div>

            {/* PRINT button */}
            <button
              type="button"
              onClick={print}
              aria-label="Print receipt"
              className="absolute grid cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4231a]"
              style={{
                left: u(300),
                top: u(104),
                width: u(72),
                height: u(72),
                background:
                  "radial-gradient(circle at 50% 45%, #2f2d29, #1a1917)",
                boxShadow: `inset 0 ${u(2)} ${u(3)} rgb(0 0 0 / 0.6), 0 ${u(1)} 0 rgb(255 255 255 / 0.9)`,
              }}
            >
              <span
                className="grid place-items-center rounded-full font-bold tracking-[0.14em] text-white transition-[transform,box-shadow,filter] duration-100"
                style={{
                  width: u(60),
                  height: u(60),
                  fontSize: u(11),
                  background:
                    "radial-gradient(circle at 38% 30%, #ff8a7a 0%, #f2392c 38%, #c81d13 75%, #9c140d 100%)",
                  boxShadow: pressed
                    ? `inset 0 ${u(3)} ${u(6)} rgb(80 0 0 / 0.55)`
                    : `inset 0 ${u(-3)} ${u(5)} rgb(80 0 0 / 0.45), inset 0 ${u(2)} ${u(2)} rgb(255 200 190 / 0.7), 0 ${u(4)} ${u(6)} rgb(0 0 0 / 0.45)`,
                  transform: pressed
                    ? `translateY(${u(2)}) scale(0.96)`
                    : "none",
                  filter: pressed ? "brightness(0.92)" : "none",
                  textShadow: `0 ${u(1)} ${u(1)} rgb(100 0 0 / 0.6)`,
                }}
              >
                PRINT
              </span>
            </button>

            {/* maker's mark */}
            <span
              aria-hidden
              className="absolute bg-clip-text font-bold tracking-[-0.02em] text-transparent"
              style={{
                left: u(34),
                top: u(182),
                fontSize: u(18),
                backgroundImage:
                  "linear-gradient(180deg, #6b6b70 0%, #1c1c1f 42%, #000 50%, #0b0b0d 78%, #2a2a2e 100%)",
                filter: `drop-shadow(0 ${u(1)} 0 rgb(255 255 255 / 0.9)) drop-shadow(0 ${u(1)} ${u(1.5)} rgb(0 0 0 / 0.25))`,
              }}
            >
              {makerMark}
            </span>
          </div>

          {/* serrated tear bar over the slot, above the paper */}
          <div
            className="absolute z-20"
            style={{
              left: u(PAPER_X - 22),
              width: u(PAPER_W + 44),
              top: u(slotY - 12),
              height: u(7),
              background:
                "linear-gradient(180deg, #f4f5f7, #a9adb5 60%, #7c8089)",
              WebkitMask: ZIGZAG_TOP_SMALL,
              mask: ZIGZAG_TOP_SMALL,
              filter: `drop-shadow(0 ${u(1)} ${u(1)} rgb(0 0 0 / 0.35))`,
            }}
          />

          {/* hint */}
          <motion.p
            key={hint}
            aria-live="polite"
            initial={{ opacity: 0, y: 4, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            className={cn(
              "absolute inset-x-0 text-center font-medium",
              transparent ? "text-white/90" : "text-[#5c574e]",
            )}
            style={{ top: u(printerTop + 252), fontSize: embedded ? u(14) : u(13) }}
          >
            {hint}
          </motion.p>
        </div>
      </div>
    </MotionConfig>
  );
}

/* ---------------------------------------------------------------------------
 * The paper
 * ------------------------------------------------------------------------- */

const ZIGZAG_TOP =
  "conic-gradient(from 135deg at top, #0000, #000 1deg 89deg, #0000 90deg) 50% / calc(var(--u) * 12) 100%";
const ZIGZAG_TOP_SMALL =
  "conic-gradient(from 135deg at top, #0000, #000 1deg 89deg, #0000 90deg) 50% / calc(var(--u) * 6) 100%";
const ZIGZAG_BOTTOM =
  "conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / calc(var(--u) * 12) 100%";

function Row({ l, r, strong }: { l: string; r: string; strong?: boolean }) {
  return (
    <div
      className={cn("flex justify-between gap-3", strong && "font-bold")}
      style={{ fontSize: u(strong ? 14 : 11.5) }}
    >
      <span className="truncate">{l}</span>
      <span className="shrink-0 tabular-nums">{r}</span>
    </div>
  );
}

function Rule() {
  return (
    <div
      className="border-t border-dashed border-[#2a2a2a]/50"
      style={{ margin: `${u(9)} 0` }}
    />
  );
}

type PaperProps = {
  store: string;
  address: string;
  items: ReceiptItem[];
  currency: string;
  total: number;
  tax: number;
  taxRate: number;
  photoContent?: ReactNode;
  showPricing: boolean;
  photoOnly?: boolean;
  itemValueFormatter?: (item: ReceiptItem, index: number) => string;
};

/** The strip: receipts joined end to end, each shown as far as it has printed. */
function Strip({ strip, paper }: { strip: Receipt[]; paper: PaperProps }) {
  return (
    <div
      className={cn(paper.photoOnly && "w-fit mx-auto max-w-full")}
      style={{ boxShadow: `0 ${u(10)} ${u(24)} ${u(-6)} rgb(40 35 25 / 0.35)` }}
    >
      {strip.map((r, i) => (
        <Segment key={r.id} receipt={r} first={i === 0} paper={paper} />
      ))}
    </div>
  );
}

function Segment({
  receipt,
  first,
  paper,
}: {
  receipt: Receipt;
  first: boolean;
  paper: PaperProps;
}) {
  const inner = useRef(null as HTMLDivElement | null);
  const full = useMotionValue(0); // the whole receipt's height, measured
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    full.set(el.offsetHeight);
    const ro = new ResizeObserver(() => full.set(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [full]);
  // only the printed part exists yet; as it grows, everything above it rises out of the slot
  const height = useTransform(() => receipt.frac.get() * full.get());
  return (
    <motion.div className="relative overflow-hidden" style={{ height }}>
      <div ref={inner}>
        <Paper receipt={receipt} first={first} {...paper} />
      </div>
    </motion.div>
  );
}

function Paper({
  receipt,
  first,
  store,
  address,
  items,
  currency,
  total,
  tax,
  taxRate,
  photoContent,
  showPricing,
  photoOnly = false,
  itemValueFormatter,
}: {
  receipt: Receipt;
  first?: boolean;
  store: string;
  address: string;
  items: ReceiptItem[];
  currency: string;
  total: number;
  tax: number;
  taxRate: number;
  photoContent?: ReactNode;
  showPricing: boolean;
  photoOnly?: boolean;
  itemValueFormatter?: (item: ReceiptItem, index: number) => string;
}) {
  if (photoOnly && photoContent) {
    return (
      <div className="relative w-fit max-w-full mx-auto overflow-hidden bg-white">
        {photoContent}
        {/* the top end of the strip curls a touch */}
        {first && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0"
            style={{
              height: u(26),
              background:
                "linear-gradient(180deg, rgb(0 0 0 / 0.07), transparent)",
            }}
          />
        )}
      </div>
    );
  }

  const money = (n: number) => `${currency}${n.toLocaleString("en-US")}`;
  const bars = Array.from(
    { length: 46 },
    (_, i) => ((receipt.order * (i + 7) * 31 + i * i) % 3) + 1,
  );

  return (
    <div
      className="relative font-mono text-[#262624]"
      style={{
        padding: `${u(22)} ${u(22)} ${u(30)}`,
        lineHeight: 1.55,
        background:
          "linear-gradient(90deg, #f1f0eb 0%, #fdfdfa 6%, #fdfdfa 94%, #eeede8 100%)",
      }}
    >
      {/* thermal print is never quite black */}
      <div style={{ opacity: 0.88, filter: "blur(0.15px)" }}>
        <div className="text-center">
          <div
            className="font-bold tracking-[0.08em] uppercase"
            style={{ fontSize: u(17) }}
          >
            {store}
          </div>
          <div className="truncate" style={{ fontSize: u(10.5) }}>
            {address}
          </div>
        </div>
        <Rule />
        <Row l={`Order #${String(receipt.order).padStart(4, "0")}`} r="" />
        <Row l={receipt.date} r="" />
        <Rule />
      </div>

      {photoContent && (
        <div style={{ margin: `${u(6)} 0` }}>
          {photoContent}
          <div style={{ opacity: 0.88, filter: "blur(0.15px)" }}>
            <Rule />
          </div>
        </div>
      )}

      <div style={{ opacity: 0.88, filter: "blur(0.15px)" }}>
        {items.map((it, idx) => (
          <Row
            key={`${it.name}-${idx}`}
            l={itemValueFormatter ? it.name : `${it.qty} x ${it.name}`}
            r={
              itemValueFormatter
                ? itemValueFormatter(it, idx)
                : money(it.qty * it.price)
            }
          />
        ))}
        <Rule />
        {showPricing && (
          <>
            <Row l="Subtotal" r={money(total)} />
            <Row l={`Tax ${Math.round(taxRate * 100)}%`} r={money(tax)} />
            <div style={{ height: u(6) }} />
            <Row l="Total" r={money(total + tax)} strong />
            <Rule />
          </>
        )}
        <div
          className="flex items-stretch justify-center"
          style={{ height: u(46), gap: u(1.5), marginTop: u(6) }}
        >
          {bars.map((w, i) => (
            <span
              key={i}
              className="bg-[#262624]"
              style={{ width: u(w * 1.4), opacity: i % 5 === 0 ? 0.85 : 1 }}
            />
          ))}
        </div>
        <div
          className="text-center tracking-[0.3em]"
          style={{ fontSize: u(9.5), marginTop: u(4) }}
        >
          {String(receipt.order).padStart(4, "0")} 2026 1110
        </div>
        <div
          className="text-center font-bold tracking-[0.2em]"
          style={{ fontSize: u(12), marginTop: u(14) }}
        >
          THANK YOU
        </div>
      </div>
      {/* the top end of the strip curls a touch */}
      {first && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0"
          style={{
            height: u(26),
            background:
              "linear-gradient(180deg, rgb(0 0 0 / 0.07), transparent)",
          }}
        />
      )}
    </div>
  );
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .45 0 0 0 0 .4 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* ---------------------------------------------------------------------------
 * Sound: tiny WebAudio synth, created on the first touch
 * ------------------------------------------------------------------------- */

let audio: AudioContext | null = null;
const ac = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;
    return (audio ??= new AudioCtx());
  } catch {
    return null;
  }
};
let master: GainNode | null = null;
let muted = false;
/** Where every sound goes: one gain node, so muting silences everything at once. */
const globalOut = (): GainNode | null => {
  const c = ac();
  if (!c) return null;
  try {
    if (!master) {
      master = c.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(c.destination);
    }
    return master;
  } catch {
    return null;
  }
};
const setMuted = (m: boolean) => {
  muted = m;
  if (master) master.gain.value = m ? 0 : 1;
};

function tone(
  freq: number,
  dur: number,
  o: { type?: OscillatorType; gain?: number; at?: number; to?: number } = {},
) {
  const c = ac();
  const out = globalOut();
  if (!c || !out) return;
  try {
    const t = c.currentTime + (o.at ?? 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = o.type ?? "sine";
    osc.frequency.setValueAtTime(freq, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.gain ?? 0.15, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  } catch {
    // Ignore audio errors when WebAudio is blocked by browser autoplay policy.
  }
}

function noise(
  dur: number,
  o: {
    at?: number;
    gain?: number;
    freq?: number;
    type?: BiquadFilterType;
  } = {},
) {
  const c = ac();
  const out = globalOut();
  if (!c || !out) return;
  try {
    const t = c.currentTime + (o.at ?? 0);
    const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = o.type ?? "lowpass";
    f.frequency.value = o.freq ?? 800;
    const g = c.createGain();
    g.gain.setValueAtTime(o.gain ?? 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(out);
    src.start(t);
  } catch {
    // Ignore audio errors when WebAudio is blocked by browser autoplay policy.
  }
}

const sfx = {
  unlock: () => {
    try {
      const c = ac();
      if (c && c.state === "suspended") {
        void c.resume().catch(() => {});
      }
    } catch {
      // Ignore audio unlock errors
    }
  },
  button: () => {
    noise(0.02, { freq: 1300, type: "bandpass", gain: 0.6 });
    tone(230, 0.05, { gain: 0.08, to: 160 });
  },
  /**
   * The feed motor: a filtered sawtooth whine, chopped fast like a stepper advancing line by line,
   * with a little paper hiss on top. Fades in and out. Returns a stop for when the feed is cut short.
   */
  feed: (dur: number) => {
    const c = ac();
    const global = globalOut();
    if (!c || !global) return () => {};
    try {
      const t = c.currentTime;
      const out = c.createGain();
      out.gain.setValueAtTime(0.0001, t);
      out.gain.exponentialRampToValueAtTime(0.06, t + 0.06);
      out.gain.setValueAtTime(0.06, t + Math.max(0.07, dur - 0.1));
      out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      out.connect(global);

      const chop = c.createGain(); // swings 0.16..1 at the line rate
      chop.gain.value = 0.58;
      const lfo = c.createOscillator();
      lfo.type = "square";
      lfo.frequency.value = 34;
      const depth = c.createGain();
      depth.gain.value = 0.42;
      lfo.connect(depth).connect(chop.gain);
      chop.connect(out);

      const motor = c.createOscillator();
      motor.type = "sawtooth";
      motor.frequency.setValueAtTime(290, t);
      motor.frequency.linearRampToValueAtTime(320, t + dur);
      const body = c.createBiquadFilter();
      body.type = "bandpass";
      body.frequency.value = 1300;
      body.Q.value = 1.4;
      motor.connect(body).connect(chop);

      const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const hiss = c.createBufferSource();
      hiss.buffer = buf;
      const air = c.createBiquadFilter();
      air.type = "bandpass";
      air.frequency.value = 5200;
      air.Q.value = 0.8;
      const hissGain = c.createGain();
      hissGain.gain.value = 0.35;
      hiss.connect(air).connect(hissGain).connect(chop);

      for (const n of [lfo, motor, hiss]) {
        n.start(t);
        n.stop(t + dur + 0.05);
      }
      return () => {
        try {
          const now = c.currentTime;
          out.gain.cancelScheduledValues(now);
          out.gain.setValueAtTime(Math.max(out.gain.value, 0.0001), now);
          out.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        } catch {
          // Ignore audio stop errors
        }
      };
    } catch {
      return () => {};
    }
  },
  done: () => {
    tone(1568, 0.09, { gain: 0.03 });
    tone(2093, 0.14, { at: 0.08, gain: 0.025 });
  },
  /** Paper tearing across the serrated bar: a quick run of uneven crackles. */
  rip: () => {
    for (let i = 0; i < 12; i++)
      noise(0.018 + Math.random() * 0.02, {
        at: i * 0.02 + Math.random() * 0.01,
        freq: 2200 + Math.random() * 3000,
        type: "highpass",
        gain: 0.25 + Math.random() * 0.3,
      });
  },
  cut: () => {
    noise(0.04, { freq: 3000, type: "highpass", gain: 0.5 });
    tone(900, 0.04, { gain: 0.05 });
  },
};
