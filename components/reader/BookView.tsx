import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { pageUrl, type BookInfo } from "@/lib/books";
import { buildSpreads, spreadOfPage, spreadPage, swipeDirection } from "@/lib/readerLogic";

interface Props {
  id: string;
  info: BookInfo;
  page: number;
  size: { w: number; h: number };
  rtl: boolean;
  filter: string;
  onGoPage: (page: number) => void;
  /** called when a page starts turning (for the paper sound) */
  onTurn?: () => void;
  onToggleChrome: () => void;
}

export interface BookViewHandle {
  go: (dir: 1 | -1) => void;
}

interface Flip {
  dir: 1 | -1;
  from: number;
  to: number;
  stage: "start" | "go";
}

const FLIP_MS = 850;

// A book on the screen: two pages side by side (one on phones) and a leaf that turns
// around the spine in 3D. The cover is alone; an Arabic book opens from the right.
const BookView = forwardRef<BookViewHandle, Props>(function BookView(
  { id, info, page, size, rtl, filter, onGoPage, onTurn, onToggleChrome },
  handle,
) {
  const single = size.w < 780;
  const spreads = useMemo(() => buildSpreads(info.pages, single), [info.pages, single]);
  const si = spreadOfPage(spreads, page);
  const [flip, setFlip] = useState<Flip | null>(null);
  const timers = useRef<number[]>([]);
  const start = useRef<{ x: number; y: number } | null>(null);

  const availH = Math.max(160, size.h - 120);
  const pw = Math.max(100, Math.floor(single ? Math.min(size.w - 24, availH / info.ratio) : Math.min((size.w - 56) / 2, availH / info.ratio)));
  const ph = Math.round(pw * info.ratio);

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  const go = (dir: 1 | -1) => {
    if (flip) return;
    const to = si + dir;
    if (to < 0 || to >= spreads.length) return;
    onTurn?.();
    setFlip({ dir, from: si, to, stage: "start" });
    timers.current.push(
      window.setTimeout(() => setFlip((f) => (f ? { ...f, stage: "go" } : f)), 30),
      window.setTimeout(() => {
        onGoPage(spreadPage(spreads[to]));
        setFlip(null);
      }, FLIP_MS + 60),
    );
  };
  useImperativeHandle(handle, () => ({ go }));

  // load the neighbouring spreads in advance
  useEffect(() => {
    for (const s of [spreads[si + 1], spreads[si + 2], spreads[si - 1]]) {
      for (const n of [s?.earlier, s?.later]) if (n) new Image().src = pageUrl(id, info, n);
    }
  }, [id, info, spreads, si]);

  const cell = (n: number | undefined, side?: "left" | "right") =>
    n === undefined ? (
      <div className="sr-bpage sr-bpage-blank" style={{ width: pw, height: ph }} />
    ) : (
      <div className={`sr-bpage ${side ? "sr-" + side : ""}`} style={{ width: pw, height: ph }}>
        <img src={pageUrl(id, info, n)} alt={`صفحة ${n}`} draggable={false} decoding="async" style={{ filter }} />
      </div>
    );

  // what lies on each side right now
  let later = spreads[si]?.later;
  let earlier = spreads[si]?.earlier;
  let leaf: { a?: number; b?: number; angle: number } | null = null;
  const flippedAngle = rtl ? 180 : -180;
  if (flip) {
    const from = spreads[flip.from];
    const to = spreads[flip.to];
    if (flip.dir === 1) {
      leaf = { a: from.later, b: to.earlier, angle: flip.stage === "start" ? 0 : flippedAngle };
      later = to.later;
      earlier = from.earlier;
    } else {
      leaf = { a: to.later, b: from.earlier, angle: flip.stage === "start" ? flippedAngle : 0 };
      later = from.later;
      earlier = to.earlier;
    }
  }

  const left = rtl ? later : earlier;
  const right = rtl ? earlier : later;
  const spreadWidth = single ? pw : pw * 2;

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s || (e.target as HTMLElement).closest(".sr-book-hit")) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      const rel = e.clientX / size.w;
      if (rel > 0.22 && rel < 0.78) onToggleChrome();
      return;
    }
    if (Math.abs(dy) > Math.abs(dx)) return;
    const d = swipeDirection(dx, rtl);
    if (d) go(d);
  };

  return (
    <div className="sr-book" onPointerDown={onPointerDown} onPointerUp={onPointerUp} data-testid="book-view">
      <div className="sr-spread" style={{ width: spreadWidth, height: ph }}>
        {single ? (
          cell(later)
        ) : (
          <>
            {cell(left, "left")}
            {cell(right, "right")}
          </>
        )}
        {leaf && (
          <div
            className="sr-leaf"
            data-testid="leaf"
            style={{
              width: pw,
              height: ph,
              left: single ? 0 : rtl ? 0 : pw,
              transformOrigin: rtl ? "right center" : "left center",
              transform: `rotateY(${leaf.angle}deg)`,
              transition: flip?.stage === "start" ? "none" : undefined,
            }}
          >
            <div className="sr-face">
              {leaf.a !== undefined && <img src={pageUrl(id, info, leaf.a)} alt="" draggable={false} style={{ filter }} />}
            </div>
            <div className="sr-face sr-face-back">
              {leaf.b !== undefined && <img src={pageUrl(id, info, leaf.b)} alt="" draggable={false} style={{ filter }} />}
            </div>
          </div>
        )}
      </div>
      <button type="button" className="sr-book-hit" style={{ left: 0 }} aria-label={rtl ? "الصفحة التالية" : "الصفحة السابقة"} onClick={() => go(rtl ? 1 : -1)} />
      <button type="button" className="sr-book-hit" style={{ right: 0 }} aria-label={rtl ? "الصفحة السابقة" : "الصفحة التالية"} onClick={() => go(rtl ? -1 : 1)} />
    </div>
  );
});

export default BookView;
