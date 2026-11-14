import { useCallback, useEffect, useRef, useState } from "react";
import { loadPdfJs, pdfJsOptions } from "@/lib/pdfjs";
import { pdfSources } from "@/lib/pdfSources";

// Draws the PDF page by page on <canvas> elements, so it works on phones where
// the browser would download the file instead of showing it. Only the pages
// near the screen are drawn; the others are released to save memory.

const ZOOMS = [0.6, 0.8, 1, 1.25, 1.5, 2, 2.5, 3];
const MAX_PIXELS = 12_000_000; // per canvas, keeps phones from running out of memory
const pageKey = (url: string) => `sao-page:${url}`;

interface PageProps {
  pdf: any;
  pageNumber: number;
  cssWidth: number;
  ratio: number;
  root: HTMLElement | null;
}

function PdfPage({ pdf, pageNumber, cssWidth, ratio, root }: PageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [near, setNear] = useState(false);
  const [ownRatio, setOwnRatio] = useState(ratio);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !root) return;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      root,
      rootMargin: "150% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [root]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!near || cssWidth <= 0) {
      canvas.width = 0; // free the memory of pages far from the screen
      canvas.height = 0;
      return;
    }
    let cancelled = false;
    let task: any;
    (async () => {
      const page = await pdf.getPage(pageNumber);
      if (cancelled) return;
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: cssWidth / base.width });
      let dpr = Math.min(window.devicePixelRatio || 1, 2);
      while (viewport.width * dpr * viewport.height * dpr > MAX_PIXELS && dpr > 1) dpr -= 0.25;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      setOwnRatio(base.height / base.width);
      task = page.render({
        canvas,
        viewport,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
      });
      await task.promise;
      page.cleanup();
    })().catch((err) => {
      if (err?.name !== "RenderingCancelledException") console.warn("page render failed", err);
    });
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [near, cssWidth, pdf, pageNumber]);

  return (
    <div
      ref={wrapRef}
      data-page={pageNumber}
      className="bg-white shadow-lg"
      style={{ width: cssWidth, height: Math.round(cssWidth * ownRatio) }}
    >
      <canvas ref={canvasRef} aria-label={`صفحة ${pageNumber}`} className="block" />
    </div>
  );
}

export default function PdfCanvasViewer({ pdfUrl }: { pdfUrl: string }) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [progress, setProgress] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [pdf, setPdf] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [ratio, setRatio] = useState(1.4);
  const [zoomIndex, setZoomIndex] = useState(2); // 1x = fit to width
  const [width, setWidth] = useState(0);
  const [current, setCurrent] = useState(1);
  const restored = useRef(false);

  // available width
  useEffect(() => {
    if (!root) return;
    const measure = () => setWidth(root.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [root]);

  // load the document (the site's own copy first, then the external repository)
  useEffect(() => {
    let cancelled = false;
    let task: any;
    restored.current = false;
    setStatus("loading");
    setProgress(0);
    setPdf(null);
    (async () => {
      const lib = await loadPdfJs();
      let lastError: unknown;
      const sources = pdfSources(pdfUrl);
      for (const [index, url] of sources.entries()) {
        try {
          // Is the site's own copy there? A tiny HEAD request answers without loading the book.
          if (index < sources.length - 1) {
            const probe = await fetch(url, { method: "HEAD" }).catch(() => null);
            if (!probe || !probe.ok) continue;
          }
          task = lib.getDocument({ url, ...pdfJsOptions });
          task.onProgress = ({ loaded, total }: { loaded: number; total?: number }) => {
            if (!cancelled && total) setProgress(Math.round((loaded / total) * 100));
          };
          const doc = await task.promise;
          if (cancelled) {
            void doc.destroy();
            return;
          }
          const first = await doc.getPage(1);
          const vp = first.getViewport({ scale: 1 });
          setRatio(vp.height / vp.width);
          setNumPages(doc.numPages);
          setPdf(doc);
          setStatus("ready");
          return;
        } catch (err) {
          lastError = err;
          // free the failed attempt (a missing local copy is normal: the next source is tried)
          void Promise.resolve(task?.destroy?.()).catch(() => undefined);
          if (cancelled) return;
        }
      }
      throw lastError;
    })().catch(() => {
      if (!cancelled) setStatus("error");
    });
    return () => {
      cancelled = true;
      void task?.destroy?.();
    };
  }, [pdfUrl, attempt]);

  const cssWidth = Math.max(0, Math.round((width - 16) * ZOOMS[zoomIndex]));

  const scrollToPage = useCallback(
    (n: number, smooth = false) => {
      const el = root?.querySelector<HTMLElement>(`[data-page="${n}"]`);
      if (el && root) root.scrollTo({ top: el.offsetTop - 8, behavior: smooth ? "smooth" : "auto" });
    },
    [root],
  );

  // continue where the reader stopped
  useEffect(() => {
    if (status !== "ready" || !root || cssWidth <= 0 || restored.current) return;
    restored.current = true;
    let saved = 1;
    try {
      saved = Number(localStorage.getItem(pageKey(pdfUrl))) || 1;
    } catch {
      /* storage unavailable */
    }
    if (saved > 1 && saved <= numPages) requestAnimationFrame(() => scrollToPage(saved));
  }, [status, root, cssWidth, numPages, pdfUrl, scrollToPage]);

  // which page is in the middle of the screen
  useEffect(() => {
    if (!root || status !== "ready") return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const mid = root.scrollTop + root.clientHeight / 2;
        const pages = root.querySelectorAll<HTMLElement>("[data-page]");
        let found = 1;
        for (const el of pages) {
          if (el.offsetTop <= mid) found = Number(el.dataset.page);
          else break;
        }
        setCurrent(found);
      });
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      root.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [root, status]);

  useEffect(() => {
    if (status !== "ready" || !restored.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(pageKey(pdfUrl), String(current));
      } catch {
        /* storage unavailable */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [current, status, pdfUrl]);

  const btn = "px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40";

  if (status === "error") {
    return (
      <div className="h-full flex items-center justify-center text-center text-white p-6">
        <div>
          <h3 className="text-xl font-bold mb-2">تعذّر عرض الملف</h3>
          <p className="text-gray-300 mb-4">تأكد من اتصالك بالإنترنت ثم حاول مرة أخرى.</p>
          <div className="flex gap-2 justify-center">
            <button type="button" className={btn} onClick={() => setAttempt((a) => a + 1)}>
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col bg-neutral-900 text-white select-none"
      dir="rtl"
      onContextMenu={(e) => e.preventDefault()} // no "save image as" on the pages
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-black/60 text-sm" dir="ltr">
        <div className="flex items-center gap-2">
          <button type="button" aria-label="تصغير" className={btn} disabled={zoomIndex === 0} onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}>
            −
          </button>
          <button type="button" aria-label="ملاءمة العرض" className={btn} onClick={() => setZoomIndex(2)}>
            {Math.round(ZOOMS[zoomIndex] * 100)}%
          </button>
          <button type="button" aria-label="تكبير" className={btn} disabled={zoomIndex === ZOOMS.length - 1} onClick={() => setZoomIndex((i) => Math.min(ZOOMS.length - 1, i + 1))}>
            +
          </button>
        </div>
        {status === "ready" && (
          <label className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={numPages}
              value={current}
              aria-label="رقم الصفحة"
              onChange={(e) => {
                const n = Math.min(numPages, Math.max(1, Number(e.target.value) || 1));
                setCurrent(n);
                scrollToPage(n);
              }}
              className="w-16 px-2 py-1 rounded bg-white/10 text-center"
            />
            <span>/ {numPages}</span>
          </label>
        )}
      </div>

      <div ref={setRoot} className="relative flex-1 overflow-auto" style={{ touchAction: "pan-x pan-y pinch-zoom" }}>
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300" role="status">
            جاري تحميل الكتاب… {progress > 0 ? `${progress}%` : ""}
          </div>
        )}
        {status === "ready" && (
          <div className="flex flex-col items-center gap-3 py-3 min-w-fit">
            {Array.from({ length: numPages }, (_, i) => (
              <PdfPage key={i + 1} pdf={pdf} pageNumber={i + 1} cssWidth={cssWidth} ratio={ratio} root={root} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
