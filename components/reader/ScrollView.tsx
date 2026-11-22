import { memo, useEffect, useMemo, useRef, useState } from "react";
import { pageRatio, pageUrl, type BookInfo } from "@/lib/books";

const GAP = 14;
const PAD_TOP = 66;
const BUFFER = 4; // pages kept loaded above and below the screen

interface SheetProps {
  id: string;
  info: BookInfo;
  n: number;
  width: number;
  height: number;
  load: boolean;
  filter: string;
}

const Sheet = memo(function Sheet({ id, info, n, width, height, load, filter }: SheetProps) {
  return (
    <div className="sr-sheet" data-page={n} style={{ width, height }}>
      {load ? (
        <img src={pageUrl(id, info, n)} alt={`صفحة ${n}`} draggable={false} decoding="async" style={{ filter }} />
      ) : (
        <div className="sr-wait">{n}</div>
      )}
    </div>
  );
});

interface Props {
  id: string;
  info: BookInfo;
  page: number;
  jump: { page: number; nonce: number };
  onSeen: (page: number) => void;
  width: number;
  filter: string;
  autoplay: boolean;
  speed: number;
  onToggleChrome: () => void;
}

// Every page is placed with its exact size, so the scroll position can be computed
// without touching the DOM; only the pages near the screen load their image.
export default function ScrollView({ id, info, page, jump, onSeen, width, filter, autoplay, speed, onToggleChrome }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const pageRef = useRef(page);
  pageRef.current = page;
  const [range, setRange] = useState<[number, number]>([1, 8]);

  const { heights, offsets } = useMemo(() => {
    const heights: number[] = [];
    const offsets: number[] = [];
    let y = PAD_TOP;
    for (let n = 1; n <= info.pages; n++) {
      const h = Math.round(width * pageRatio(info, n));
      heights.push(h);
      offsets.push(y);
      y += h + GAP;
    }
    return { heights, offsets };
  }, [info, width]);

  const pageAt = (y: number): number => {
    let lo = 0;
    let hi = offsets.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (offsets[mid] <= y) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const first = pageAt(el.scrollTop);
    const last = pageAt(el.scrollTop + el.clientHeight);
    setRange((r) => (r[0] === first && r[1] === last ? r : [first, last]));
    onSeen(pageAt(el.scrollTop + el.clientHeight * 0.35));
  };

  // scroll events (throttled to one update per frame)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  });

  // jump to a page (slider, thumbnails, bookmarks, resume)
  useEffect(() => {
    const el = ref.current;
    if (el && offsets[jump.page - 1] !== undefined) el.scrollTop = offsets[jump.page - 1] - 8;
    update();
  }, [jump.nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  // keep the same page when the zoom changes
  useEffect(() => {
    const el = ref.current;
    if (el && offsets[pageRef.current - 1] !== undefined) el.scrollTop = offsets[pageRef.current - 1] - 8;
    update();
  }, [width]); // eslint-disable-line react-hooks/exhaustive-deps

  // automatic scrolling
  useEffect(() => {
    if (!autoplay) return;
    let frame = 0;
    let last = performance.now();
    let carry = 0;
    const tick = (now: number) => {
      const el = ref.current;
      if (el) {
        carry += ((now - last) / 1000) * speed;
        const whole = Math.floor(carry);
        if (whole >= 1) {
          el.scrollTop += whole;
          carry -= whole;
        }
      }
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [autoplay, speed]);

  return (
    <div ref={ref} className="sr-scroll" onClick={onToggleChrome} data-testid="scroll-view">
      {heights.map((h, i) => {
        const n = i + 1;
        return (
          <Sheet key={n} id={id} info={info} n={n} width={width} height={h} load={n >= range[0] - BUFFER && n <= range[1] + BUFFER} filter={filter} />
        );
      })}
    </div>
  );
}
