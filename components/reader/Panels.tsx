import { useState } from "react";
import { thumbUrl, type BookInfo } from "@/lib/books";
import {
  FONTS,
  MODES,
  THEMES,
  ZOOMS,
  type Bookmark,
  type FontKey,
  type ReaderPrefs,
} from "@/lib/readerLogic";
import { IconBookmark, IconClose, IconMinus, IconPlus } from "./ReaderIcons";

export function PagesPanel({
  id,
  info,
  page,
  marks,
  onPick,
  onRemoveMark,
  onClose,
}: {
  id: string;
  info: BookInfo;
  page: number;
  marks: Bookmark[];
  onPick: (page: number) => void;
  onRemoveMark: (page: number) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"pages" | "marks">("pages");
  return (
    <aside className="sr-panel" aria-label="الصفحات والإشارات" data-testid="pages-panel">
      <h3>
        <span className="sr-seg">
          <button className="sr-chip" aria-pressed={tab === "pages"} onClick={() => setTab("pages")}>
            الصفحات
          </button>
          <button className="sr-chip" aria-pressed={tab === "marks"} onClick={() => setTab("marks")}>
            الإشارات ({marks.length})
          </button>
        </span>
        <button className="sr-btn" onClick={onClose} aria-label="إغلاق">
          <IconClose />
        </button>
      </h3>
      {tab === "pages" ? (
        <div className="sr-grid">
          {Array.from({ length: info.pages }, (_, i) => i + 1).map((n) => (
            <button key={n} className="sr-thumb" aria-current={n === page} aria-label={`الصفحة ${n}`} onClick={() => onPick(n)}>
              <img src={thumbUrl(id, n)} alt="" loading="lazy" decoding="async" draggable={false} />
              <span>{n}</span>
            </button>
          ))}
        </div>
      ) : marks.length === 0 ? (
        <p className="sr-empty">لا توجد إشارات بعد. اضغط على أيقونة الإشارة في الأعلى (أو المفتاح B) لحفظ مكانك في أي صفحة.</p>
      ) : (
        marks.map((m) => (
          <div className="sr-mark" key={m.page}>
            <button className="sr-chip" onClick={() => onPick(m.page)}>
              صفحة {m.page}
            </button>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{new Date(m.at).toLocaleDateString("ar-EG-u-nu-latn")}</span>
            <button className="sr-btn" onClick={() => onRemoveMark(m.page)} aria-label={`حذف إشارة صفحة ${m.page}`}>
              <IconBookmark filled />
            </button>
          </div>
        ))
      )}
    </aside>
  );
}

export function SettingsPanel({
  prefs,
  update,
  hasText,
  onMode,
  onClose,
}: {
  prefs: ReaderPrefs;
  update: (patch: Partial<ReaderPrefs>) => void;
  hasText: boolean;
  onMode: (mode: ReaderPrefs["mode"]) => void;
  onClose: () => void;
}) {
  const imageMode = prefs.mode !== "text";
  return (
    <aside className="sr-panel" aria-label="إعدادات القارئ" data-testid="settings-panel">
      <h3>
        <span>إعدادات القراءة</span>
        <button className="sr-btn" onClick={onClose} aria-label="إغلاق">
          <IconClose />
        </button>
      </h3>

      <div className="sr-group">
        <div className="sr-label">وضع القراءة</div>
        <div className="sr-seg">
          {MODES.map((m) => (
            <button key={m.id} className="sr-chip" aria-pressed={prefs.mode === m.id} disabled={m.id === "text" && !hasText} title={m.id === "text" && !hasText ? "النص غير متاح لهذا الكتاب" : undefined} onClick={() => onMode(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sr-group">
        <div className="sr-label">اتجاه الصفحات</div>
        <div className="sr-seg">
          <button className="sr-chip" aria-pressed={prefs.rtl} onClick={() => update({ rtl: true })}>
            عربي (من اليمين)
          </button>
          <button className="sr-chip" aria-pressed={!prefs.rtl} onClick={() => update({ rtl: false })}>
            من اليسار
          </button>
        </div>
      </div>

      <div className="sr-group">
        <div className="sr-label">السمة</div>
        <div className="sr-seg">
          {THEMES.map((t) => (
            <button key={t.id} className="sr-chip" aria-pressed={prefs.theme === t.id} onClick={() => update({ theme: t.id })}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sr-group">
        <div className="sr-label">
          <span>السطوع</span>
          <span>{Math.round(prefs.brightness * 100)}%</span>
        </div>
        <input className="sr-range" type="range" min={50} max={130} value={Math.round(prefs.brightness * 100)} aria-label="السطوع" onChange={(e) => update({ brightness: Number(e.target.value) / 100 })} />
      </div>

      <div className="sr-group">
        <div className="sr-label">صوت تقليب الصفحة</div>
        <div className="sr-seg">
          <button className="sr-chip" aria-pressed={prefs.sound} onClick={() => update({ sound: true })}>
            تشغيل
          </button>
          <button className="sr-chip" aria-pressed={!prefs.sound} onClick={() => update({ sound: false })}>
            إيقاف
          </button>
        </div>
      </div>

      {imageMode ? (
        <>
          <div className="sr-group">
            <div className="sr-label">
              <span>التكبير</span>
              <span>{Math.round(ZOOMS[prefs.zoomIndex] * 100)}%</span>
            </div>
            <div className="sr-seg">
              <button className="sr-btn" aria-label="تصغير" disabled={prefs.zoomIndex === 0} onClick={() => update({ zoomIndex: prefs.zoomIndex - 1 })}>
                <IconMinus />
              </button>
              <button className="sr-chip" onClick={() => update({ zoomIndex: 2 })}>
                ملاءمة
              </button>
              <button className="sr-btn" aria-label="تكبير" disabled={prefs.zoomIndex === ZOOMS.length - 1} onClick={() => update({ zoomIndex: prefs.zoomIndex + 1 })}>
                <IconPlus />
              </button>
            </div>
          </div>
          {prefs.mode === "scroll" && (
            <div className="sr-group">
              <div className="sr-label">
                <span>سرعة التمرير التلقائي</span>
                <span>{prefs.scrollSpeed}</span>
              </div>
              <input className="sr-range" type="range" min={10} max={200} step={5} value={prefs.scrollSpeed} aria-label="سرعة التمرير" onChange={(e) => update({ scrollSpeed: Number(e.target.value) })} />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="sr-group">
            <div className="sr-label">الخط</div>
            <div className="sr-seg">
              {(Object.keys(FONTS) as FontKey[]).map((k) => (
                <button key={k} className="sr-chip" style={{ fontFamily: FONTS[k].css }} aria-pressed={prefs.fontFamily === k} onClick={() => update({ fontFamily: k })}>
                  {FONTS[k].label}
                </button>
              ))}
            </div>
          </div>
          <div className="sr-group">
            <div className="sr-label">
              <span>حجم الخط</span>
              <span>{prefs.fontSize}</span>
            </div>
            <input className="sr-range" type="range" min={14} max={44} value={prefs.fontSize} aria-label="حجم الخط" onChange={(e) => update({ fontSize: Number(e.target.value) })} />
          </div>
          <div className="sr-group">
            <div className="sr-label">
              <span>تباعد الأسطر</span>
              <span>{prefs.lineHeight.toFixed(1)}</span>
            </div>
            <input className="sr-range" type="range" min={14} max={30} value={Math.round(prefs.lineHeight * 10)} aria-label="تباعد الأسطر" onChange={(e) => update({ lineHeight: Number(e.target.value) / 10 })} />
          </div>
          <div className="sr-group">
            <div className="sr-label">
              <span>عرض النص</span>
              <span>{prefs.textWidth}</span>
            </div>
            <input className="sr-range" type="range" min={420} max={1100} step={20} value={prefs.textWidth} aria-label="عرض النص" onChange={(e) => update({ textWidth: Number(e.target.value) })} />
          </div>
          <div className="sr-group">
            <div className="sr-label">
              <span>سرعة القراءة بالصوت</span>
              <span>{prefs.ttsRate.toFixed(1)}×</span>
            </div>
            <input className="sr-range" type="range" min={5} max={20} value={Math.round(prefs.ttsRate * 10)} aria-label="سرعة القراءة بالصوت" onChange={(e) => update({ ttsRate: Number(e.target.value) / 10 })} />
          </div>
        </>
      )}
      <p className="sr-empty">اختصارات: ← → تقليب · + − تكبير · B إشارة · T الصفحات · S الإعدادات · M تبديل الوضع · F ملء الشاشة</p>
    </aside>
  );
}
