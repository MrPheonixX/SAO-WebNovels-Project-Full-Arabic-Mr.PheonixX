import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./reader.css";
import { textUrl, type BookInfo } from "@/lib/books";
import { playPageTurn } from "@/lib/pageSound";
import { getBookState, saveBookPage, saveBookmarks } from "@/lib/cloud";
import {
  MODES,
  ZOOMS,
  clampPage,
  imageFilter,
  keyDirection,
  sanitizePrefs,
  scrollPageWidth,
  themeBackground,
  toggleBookmarkList,
  type Bookmark,
  type ReaderMode,
  type ReaderPrefs,
} from "@/lib/readerLogic";
import BookView, { type BookViewHandle } from "./BookView";
import { PagesPanel, SettingsPanel } from "./Panels";
import {
  IconBack,
  IconBookmark,
  IconChevronLeft,
  IconChevronRight,
  IconExitFullscreen,
  IconFullscreen,
  IconGrid,
  IconInfo,
  IconMinus,
  IconPause,
  IconPlay,
  IconPlus,
  IconSettings,
  IconSpeaker,
} from "./ReaderIcons";
import ScrollView from "./ScrollView";
import SlideView from "./SlideView";
import TextView, { type TextData } from "./TextView";

const PREFS_KEY = "sao-reader-prefs";

function loadPrefs(): ReaderPrefs {
  try {
    return sanitizePrefs(JSON.parse(localStorage.getItem(PREFS_KEY) ?? "null"));
  } catch {
    return sanitizePrefs(null);
  }
}

interface ReaderProps {
  id: string;
  title: string;
  subtitle?: string;
  info: BookInfo;
  onClose: () => void;
  onShowInfo?: () => void;
}

// The whole reading experience: four modes (scroll, slides, 3D book, text), themes,
// zoom, brightness, page thumbnails, bookmarks, resume, keyboard and touch control.
// Nothing here downloads a file: it only shows page images.
export default function Reader({ id, title, subtitle, info, onClose, onShowInfo }: ReaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<BookViewHandle>(null);
  const [prefs, setPrefs] = useState<ReaderPrefs>(() => {
    const p = loadPrefs();
    return p.mode === "text" && !info.text ? { ...p, mode: "scroll" } : p;
  });
  const [page, setPage] = useState(() => clampPage(getBookState(id).page, info.pages));
  const [jump, setJump] = useState({ page, nonce: 0 });
  const [marks, setMarks] = useState<Bookmark[]>(() => getBookState(id).bookmarks);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [chrome, setChrome] = useState(true);
  const [panel, setPanel] = useState<null | "pages" | "settings">(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [toast, setToast] = useState("");
  const [text, setText] = useState<TextData | null>(null);
  const [textFailed, setTextFailed] = useState(false);
  const [reading, setReading] = useState<[number, number] | null>(null);
  const ttsOn = useRef(false);
  const idle = useRef<number>();
  const pointerType = useRef("mouse");
  const toastTimer = useRef<number>();

  const update = useCallback((patch: Partial<ReaderPrefs>) => setPrefs((p) => ({ ...p, ...patch })), []);
  const total = info.pages;

  // ---- persistence ----
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* storage unavailable */
    }
  }, [prefs]);
  useEffect(() => {
    const t = setTimeout(() => saveBookPage(id, page), 600);
    return () => clearTimeout(t);
  }, [id, page]);

  // ---- size of the reading area ----
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // ---- text of the book (text mode) ----
  useEffect(() => {
    if (prefs.mode !== "text" || text || textFailed || !info.text) return;
    let cancelled = false;
    fetch(textUrl(id))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("no text"))))
      .then((d: TextData) => !cancelled && setText(d))
      .catch(() => !cancelled && setTextFailed(true));
    return () => {
      cancelled = true;
    };
  }, [prefs.mode, text, textFailed, id, info.text]);

  // ---- helpers ----
  const say = useCallback((message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 1600);
  }, []);

  const goTo = useCallback(
    (n: number) => {
      const target = clampPage(n, total);
      setPage(target);
      setJump((j) => ({ page: target, nonce: j.nonce + 1 }));
    },
    [total],
  );

  const go = useCallback(
    (dir: 1 | -1) => {
      if (prefs.mode === "book") bookRef.current?.go(dir);
      else {
        if (prefs.sound && prefs.mode === "slide") playPageTurn();
        goTo(page + dir);
      }
    },
    [prefs.mode, prefs.sound, goTo, page],
  );

  const setMode = (mode: ReaderMode) => {
    setAutoplay(false);
    stopSpeaking();
    setJump({ page, nonce: jump.nonce + 1 });
    update({ mode });
  };

  const marked = marks.some((m) => m.page === page);
  const toggleMark = useCallback(() => {
    setMarks((list) => {
      const next = toggleBookmarkList(list, page);
      saveBookmarks(id, next);
      say(next.length > list.length ? `تمت إضافة إشارة في صفحة ${page}` : `أُزيلت الإشارة من صفحة ${page}`);
      return next;
    });
  }, [id, page, say]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void (rootRef.current ?? document.documentElement).requestFullscreen?.().catch(() => undefined);
  };

  // ---- read aloud (text mode) ----
  function stopSpeaking() {
    ttsOn.current = false;
    setReading(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }
  const speak = (pageNum: number, index: number) => {
    if (!text || !ttsOn.current || !("speechSynthesis" in window)) return;
    const paragraphs = text.pages[pageNum - 1];
    if (!paragraphs) return stopSpeaking();
    if (index >= paragraphs.length) return speak(pageNum + 1, 0);
    const u = new SpeechSynthesisUtterance(paragraphs[index]);
    u.lang = "ar-SA";
    u.rate = prefs.ttsRate;
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("ar"));
    if (voice) u.voice = voice;
    u.onend = () => ttsOn.current && speak(pageNum, index + 1);
    u.onerror = () => stopSpeaking();
    setReading([pageNum, index]);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };
  const toggleSpeech = () => {
    if (!("speechSynthesis" in window)) return say("القراءة الصوتية غير مدعومة في هذا المتصفح");
    if (ttsOn.current) return stopSpeaking();
    ttsOn.current = true;
    speak(page, 0);
  };
  useEffect(() => () => stopSpeaking(), []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- controls that hide themselves while reading pages ----
  const bump = useCallback(() => {
    setChrome(true);
    clearTimeout(idle.current);
    if ((prefs.mode === "slide" || prefs.mode === "book") && !panel) {
      idle.current = window.setTimeout(() => setChrome(false), 3800);
    }
  }, [prefs.mode, panel]);
  useEffect(() => {
    bump();
    return () => clearTimeout(idle.current);
  }, [bump]);
  // A tap on the page shows or hides the controls on touch screens. With a mouse they
  // appear when it moves and fade after a pause, so a click must not hide them again.
  const toggleChrome = useCallback(() => {
    if (pointerType.current === "mouse") return;
    clearTimeout(idle.current);
    setChrome((c) => !c);
  }, []);

  // ---- keyboard ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      bump();
      const dir = keyDirection(e.key, prefs.rtl);
      const imageMode = prefs.mode !== "text";
      if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && dir) {
        e.preventDefault();
        go(dir);
      } else if ((e.key === "PageDown" || e.key === " ") && prefs.mode !== "slide" && prefs.mode !== "book") {
        // scrolling modes keep their natural scrolling
      } else if (dir && (prefs.mode === "slide" || prefs.mode === "book") && (e.key === "PageDown" || e.key === "PageUp")) {
        e.preventDefault();
        go(dir);
      } else if (e.key === " " && (prefs.mode === "slide" || prefs.mode === "book")) {
        e.preventDefault();
        go(e.shiftKey ? -1 : 1);
      } else if (e.key === "Home") goTo(1);
      else if (e.key === "End") goTo(total);
      else if (e.key === "+" || e.key === "=") {
        if (imageMode) update({ zoomIndex: Math.min(ZOOMS.length - 1, prefs.zoomIndex + 1) });
        else update({ fontSize: Math.min(44, prefs.fontSize + 2) });
      } else if (e.key === "-") {
        if (imageMode) update({ zoomIndex: Math.max(0, prefs.zoomIndex - 1) });
        else update({ fontSize: Math.max(14, prefs.fontSize - 2) });
      } else if (e.key === "0") update({ zoomIndex: 2 });
      else if (e.key.toLowerCase() === "f") toggleFullscreen();
      else if (e.key.toLowerCase() === "b") toggleMark();
      else if (e.key.toLowerCase() === "t") setPanel((p) => (p === "pages" ? null : "pages"));
      else if (e.key.toLowerCase() === "s") setPanel((p) => (p === "settings" ? null : "settings"));
      else if (e.key.toLowerCase() === "m") {
        const order = MODES.filter((m) => m.id !== "text" || info.text).map((m) => m.id);
        setMode(order[(order.indexOf(prefs.mode) + 1) % order.length]);
      } else if (e.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const filter = imageFilter(prefs.theme, prefs.brightness);
  const rootStyle = useMemo(() => ({ ["--sr-bg" as string]: themeBackground(prefs.theme) }), [prefs.theme]);
  const showChrome = chrome || Boolean(panel);
  const next = () => go(1);
  const prev = () => go(-1);
  // in an Arabic book "next" is on the left of the bottom bar
  const nextBtn = (
    <button className="sr-btn" onClick={next} disabled={page >= total} aria-label="الصفحة التالية">
      {prefs.rtl ? <IconChevronLeft /> : <IconChevronRight />}
    </button>
  );
  const prevBtn = (
    <button className="sr-btn" onClick={prev} disabled={page <= 1} aria-label="الصفحة السابقة">
      {prefs.rtl ? <IconChevronRight /> : <IconChevronLeft />}
    </button>
  );

  return (
    <div ref={rootRef} className="sr-root" data-theme={prefs.theme} style={rootStyle} onPointerMove={bump} onPointerDownCapture={(e) => (pointerType.current = e.pointerType)} data-testid="reader" lang="ar">
      {size.w > 0 && prefs.mode === "scroll" && (
        <ScrollView id={id} info={info} page={page} jump={jump} onSeen={setPage} width={scrollPageWidth(size.w, prefs.zoomIndex)} filter={filter} autoplay={autoplay} speed={prefs.scrollSpeed} onToggleChrome={toggleChrome} />
      )}
      {size.w > 0 && prefs.mode === "slide" && (
        <SlideView id={id} info={info} page={page} size={size} zoomIndex={prefs.zoomIndex} rtl={prefs.rtl} filter={filter} onGo={go} onToggleChrome={toggleChrome} />
      )}
      {size.w > 0 && prefs.mode === "book" && (
        <BookView ref={bookRef} id={id} info={info} page={page} size={size} rtl={prefs.rtl} filter={filter} onGoPage={(n) => setPage(n)} onTurn={() => prefs.sound && playPageTurn()} onToggleChrome={toggleChrome} />
      )}
      {prefs.mode === "text" && <TextView data={text} failed={textFailed} page={page} jump={jump} onSeen={setPage} prefs={prefs} reading={reading} onToggleChrome={toggleChrome} />}

      {/* top bar */}
      <header className={`sr-bar sr-top ${showChrome ? "" : "sr-off"}`}>
        <button className="sr-btn" onClick={onClose} aria-label="العودة">
          <IconBack />
        </button>
        <div className="sr-title">
          {title}
          {subtitle && <span className="sr-sub">{subtitle}</span>}
        </div>
        {size.w >= 980 &&
          MODES.filter((m) => m.id !== "text" || info.text).map((m) => (
            <button key={m.id} className="sr-chip" aria-pressed={prefs.mode === m.id} onClick={() => setMode(m.id)}>
              {m.label}
            </button>
          ))}
        <button className="sr-btn" aria-pressed={panel === "pages"} onClick={() => setPanel(panel === "pages" ? null : "pages")} aria-label="الصفحات والإشارات" title="الصفحات (T)">
          <IconGrid />
        </button>
        <button className="sr-btn" aria-pressed={marked} onClick={toggleMark} aria-label={marked ? "إزالة الإشارة" : "إضافة إشارة"} title="إشارة (B)">
          <IconBookmark filled={marked} />
        </button>
        <button className="sr-btn" aria-pressed={panel === "settings"} onClick={() => setPanel(panel === "settings" ? null : "settings")} aria-label="الإعدادات" title="الإعدادات (S)">
          <IconSettings />
        </button>
        {onShowInfo && (
          <button className="sr-btn sr-hide-sm" onClick={onShowInfo} aria-label="التفاصيل والتقييمات" title="التفاصيل والتقييمات">
            <IconInfo />
          </button>
        )}
        <button className="sr-btn sr-hide-sm" onClick={toggleFullscreen} aria-label={fullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"} title="ملء الشاشة (F)">
          {fullscreen ? <IconExitFullscreen /> : <IconFullscreen />}
        </button>
      </header>

      {/* bottom bar */}
      <footer className={`sr-bar sr-bottom ${showChrome ? "" : "sr-off"}`}>
        {prevBtn}
        <input
          className="sr-slider"
          type="range"
          min={1}
          max={total}
          value={page}
          data-rtl={prefs.rtl}
          dir={prefs.rtl ? "rtl" : "ltr"}
          aria-label="رقم الصفحة"
          onChange={(e) => goTo(Number(e.target.value))}
        />
        {nextBtn}
        <div className="sr-pageno">
          <input
            type="number"
            min={1}
            max={total}
            value={page}
            aria-label="انتقل إلى صفحة"
            onChange={(e) => e.target.value && goTo(Number(e.target.value))}
          />{" "}
          / {total}
        </div>
        {prefs.mode === "scroll" && (
          <button className="sr-btn" aria-pressed={autoplay} onClick={() => setAutoplay((a) => !a)} aria-label={autoplay ? "إيقاف التمرير التلقائي" : "تمرير تلقائي"} title="تمرير تلقائي">
            {autoplay ? <IconPause /> : <IconPlay />}
          </button>
        )}
        {prefs.mode === "text" && (
          <button className="sr-btn" aria-pressed={reading !== null} onClick={toggleSpeech} aria-label="قراءة بالصوت" title="قراءة بالصوت">
            <IconSpeaker />
          </button>
        )}
        {prefs.mode !== "text" && prefs.mode !== "book" && (
          <>
            <button className="sr-btn sr-hide-sm" aria-label="تصغير" disabled={prefs.zoomIndex === 0} onClick={() => update({ zoomIndex: prefs.zoomIndex - 1 })}>
              <IconMinus />
            </button>
            <button className="sr-btn sr-hide-sm" aria-label="تكبير" disabled={prefs.zoomIndex === ZOOMS.length - 1} onClick={() => update({ zoomIndex: prefs.zoomIndex + 1 })}>
              <IconPlus />
            </button>
          </>
        )}
      </footer>

      {panel === "pages" && (
        <PagesPanel
          id={id}
          info={info}
          page={page}
          marks={marks}
          onPick={(n) => {
            goTo(n);
            setPanel(null);
          }}
          onRemoveMark={(n) => {
            const next = marks.filter((m) => m.page !== n);
            setMarks(next);
            saveBookmarks(id, next);
          }}
          onClose={() => setPanel(null)}
        />
      )}
      {panel === "settings" && <SettingsPanel prefs={prefs} update={update} hasText={info.text} onMode={setMode} onClose={() => setPanel(null)} />}
      {toast && (
        <div className="sr-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
