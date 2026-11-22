import { useEffect, useRef, useState } from "react";
import { pageRatio, pageUrl, type BookInfo } from "@/lib/books";
import { swipeDirection, ZOOMS } from "@/lib/readerLogic";

interface Props {
  id: string;
  info: BookInfo;
  page: number;
  size: { w: number; h: number };
  zoomIndex: number;
  rtl: boolean;
  filter: string;
  onGo: (dir: 1 | -1) => void;
  onToggleChrome: () => void;
}

// One page at a time, fitted to the screen. Swipe, tap the sides, or use the keys.
export default function SlideView({ id, info, page, size, zoomIndex, rtl, filter, onGo, onToggleChrome }: Props) {
  const ratio = pageRatio(info, page);
  const zoom = ZOOMS[zoomIndex];
  const baseW = Math.max(120, Math.min(size.w - 16, (size.h - 16) / ratio));
  const width = Math.round(baseW * zoom);
  const height = Math.round(width * ratio);
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const lastPage = useRef(page);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    setDir(page >= lastPage.current ? 1 : -1);
    lastPage.current = page;
  }, [page]);

  // load the neighbouring pages in advance
  useEffect(() => {
    for (const n of [page + 1, page + 2, page - 1]) {
      if (n >= 1 && n <= info.pages) new Image().src = pageUrl(id, info, n);
    }
  }, [id, info, page]);

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY, t: Date.now() };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      // a tap: the sides turn the page, the middle shows or hides the controls
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const rel = (e.clientX - rect.left) / rect.width;
      if (rel < 0.28) onGo(rtl ? 1 : -1);
      else if (rel > 0.72) onGo(rtl ? -1 : 1);
      else onToggleChrome();
      return;
    }
    if (zoom > 1 || Math.abs(dy) > Math.abs(dx)) return; // zoomed pages scroll instead
    const d = swipeDirection(dx, rtl);
    if (d) onGo(d);
  };

  return (
    <div className="sr-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp} data-testid="slide-view">
      <div key={page} className="sr-slide sr-slide-anim" style={{ width, height, ["--sr-dir" as string]: dir * (rtl ? -1 : 1) }}>
        <img src={pageUrl(id, info, page)} alt={`صفحة ${page}`} draggable={false} decoding="async" style={{ filter }} />
      </div>
    </div>
  );
}
