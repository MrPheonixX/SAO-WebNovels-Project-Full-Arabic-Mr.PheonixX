// Everything the profile page shows is derived from the reader's real history
// (which works they opened, and when); nothing here is invented.
import type { PDFWork } from "../data/pdfWorks";

export type History = Record<string, { lastOpened: string; opens: number }>;

export interface HistoryItem {
  id: string;
  title: string;
  lastOpened: string;
  opens: number;
}

export interface Summary {
  distinct: number;
  totalOpens: number;
  items: HistoryItem[]; // newest first
  xp: number;
  level: number;
  levelProgress: number; // 0-100
}

export const XP_PER_WORK = 50; // first time a work is opened
export const XP_PER_OPEN = 10; // every open
export const XP_PER_LEVEL = 200;

export function summarize(history: History, catalog: PDFWork[]): Summary {
  const byId = new Map(catalog.map((w) => [w.id, w]));
  const items: HistoryItem[] = Object.entries(history)
    .filter(([id]) => byId.has(id)) // ignore works that left the catalog
    .map(([id, h]) => ({
      id,
      title: byId.get(id)!.titleAr,
      lastOpened: h.lastOpened,
      opens: h.opens,
    }))
    .sort((a, b) => Date.parse(b.lastOpened) - Date.parse(a.lastOpened));
  const distinct = items.length;
  const totalOpens = items.reduce((n, i) => n + i.opens, 0);
  const xp = distinct * XP_PER_WORK + totalOpens * XP_PER_OPEN;
  return {
    distinct,
    totalOpens,
    items,
    xp,
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    levelProgress: ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100,
  };
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  progress: number;
  max: number;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const make = (
  id: string,
  icon: string,
  title: string,
  description: string,
  progress: number,
  max: number,
  rarity: Achievement["rarity"],
): Achievement => ({
  id,
  icon,
  title,
  description,
  progress: Math.min(progress, max),
  max,
  unlocked: progress >= max,
  rarity,
});

export function buildAchievements(
  history: History,
  catalog: PDFWork[],
  hasAccount: boolean,
): Achievement[] {
  const opened = new Set(Object.keys(history));
  const known = catalog.filter((w) => opened.has(w.id));
  const seriesOpened = new Set(known.map((w) => w.series)).size;
  const countOpened = (series: string) =>
    known.filter((w) => w.series === series && w.volumeNumber).length;
  const total = (series: string) =>
    catalog.filter((w) => w.series === series && w.volumeNumber).length;

  return [
    make("first", "👣", "الخطوة الأولى", "افتح أول عمل", known.length, 1, "common"),
    make("five", "📚", "قارئ نهم", "افتح 5 أعمال مختلفة", known.length, 5, "common"),
    make("ten", "🏆", "خزانة كتب", "افتح 10 أعمال مختلفة", known.length, 10, "rare"),
    make("explorer", "🧭", "مستكشف", "افتح أعمالاً من سلسلتين مختلفتين", seriesOpened, 2, "rare"),
    make(
      "sao",
      "⚔️",
      "خبير ساو",
      "افتح كل مجلدات ساو",
      countOpened("Sword Art Online"),
      Math.max(1, total("Sword Art Online")),
      "legendary",
    ),
    make(
      "progressive",
      "🌸",
      "عاشق بروجرسيف",
      "افتح كل مجلدات ساو بروجرسيف",
      countOpened("Sword Art Online Progressive"),
      Math.max(1, total("Sword Art Online Progressive")),
      "epic",
    ),
    make("member", "🙋", "عضو مسجّل", "أنشئ حساباً على الموقع", hasAccount ? 1 : 0, 1, "common"),
  ];
}
