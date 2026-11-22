import { useEffect, useRef } from "react";
import { FONTS, type ReaderPrefs } from "@/lib/readerLogic";

export interface TextData {
  pages: string[][];
}

interface Props {
  data: TextData | null;
  failed: boolean;
  page: number;
  jump: { page: number; nonce: number };
  onSeen: (page: number) => void;
  prefs: ReaderPrefs;
  /** paragraph being read aloud: [page, index] */
  reading: [number, number] | null;
  onToggleChrome: () => void;
}

// The book as reflowable text with the reader's own Arabic font, size and spacing.
export default function TextView({ data, failed, page, jump, onSeen, prefs, reading, onToggleChrome }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const pageRef = useRef(page);
  pageRef.current = page;

  const scrollToPage = (n: number) => {
    const el = ref.current?.querySelector<HTMLElement>(`[data-tpage="${n}"]`);
    if (el && ref.current) ref.current.scrollTop = el.offsetTop - 70;
  };

  useEffect(() => {
    if (data) scrollToPage(jump.page);
  }, [jump.nonce, data]); // eslint-disable-line react-hooks/exhaustive-deps

  // keep the place when the font or size changes
  useEffect(() => {
    if (data) scrollToPage(pageRef.current);
  }, [prefs.fontFamily, prefs.fontSize, prefs.lineHeight, prefs.textWidth]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = ref.current;
    if (!el || !data) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const mid = el.scrollTop + 90;
        let found = 1;
        for (const marker of el.querySelectorAll<HTMLElement>("[data-tpage]")) {
          if (marker.offsetTop <= mid) found = Number(marker.dataset.tpage);
          else break;
        }
        onSeen(found);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [data, onSeen]);

  // follow the paragraph that is being read aloud
  useEffect(() => {
    if (!reading) return;
    ref.current?.querySelector<HTMLElement>(`[data-tp="${reading[0]}-${reading[1]}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [reading]);

  const style = {
    ["--sr-font" as string]: FONTS[prefs.fontFamily].css,
    ["--sr-fs" as string]: `${prefs.fontSize}px`,
    ["--sr-lh" as string]: String(prefs.lineHeight),
    ["--sr-tw" as string]: `${prefs.textWidth}px`,
  };

  if (failed) {
    return (
      <div className="sr-text">
        <p className="sr-note">النص غير متاح لهذا الكتاب (قد يكون الملف مصوّراً). استخدم أحد أوضاع الصفحات.</p>
      </div>
    );
  }
  if (!data) return <div className="sr-loading">جاري تحميل النص…</div>;

  return (
    <div ref={ref} className="sr-text" onClick={onToggleChrome} data-testid="text-view">
      <div className="sr-textcol" style={style} dir="rtl" lang="ar">
        {data.pages.map((paragraphs, i) => (
          <section key={i} data-tpage={i + 1}>
            <div className="sr-pgmark">{i + 1}</div>
            {paragraphs.map((p, j) => (
              <p key={j} data-tp={`${i + 1}-${j}`} className={reading && reading[0] === i + 1 && reading[1] === j ? "sr-reading" : undefined}>
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
