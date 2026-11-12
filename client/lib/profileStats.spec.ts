import { describe, it, expect } from "vitest";
import { pdfWorks } from "../data/pdfWorks";
import { buildAchievements, summarize } from "./profileStats";

const sao = pdfWorks.filter((w) => w.series === "Sword Art Online" && w.volumeNumber);

describe("summarize", () => {
  it("is all zeros for a new reader", () => {
    const s = summarize({}, pdfWorks);
    expect([s.distinct, s.totalOpens, s.xp, s.level, s.levelProgress]).toEqual([0, 0, 0, 1, 0]);
  });
  it("counts works and opens, orders newest first and ignores unknown works", () => {
    const s = summarize(
      {
        [pdfWorks[0].id]: { lastOpened: "2026-01-01T00:00:00Z", opens: 2 },
        [pdfWorks[1].id]: { lastOpened: "2026-02-01T00:00:00Z", opens: 1 },
        gone: { lastOpened: "2026-03-01T00:00:00Z", opens: 9 },
      },
      pdfWorks,
    );
    expect(s.distinct).toBe(2);
    expect(s.totalOpens).toBe(3);
    expect(s.items[0].id).toBe(pdfWorks[1].id);
    expect(s.xp).toBe(2 * 50 + 3 * 10);
    expect(s.level).toBe(1);
    expect(Math.round(s.levelProgress)).toBe(65);
  });
});

describe("achievements", () => {
  it("unlocks only what the history proves", () => {
    const none = buildAchievements({}, pdfWorks, false);
    expect(none.some((a) => a.unlocked)).toBe(false);
    const hist: any = {};
    for (const w of sao.slice(0, 5)) hist[w.id] = { lastOpened: "2026-01-01T00:00:00Z", opens: 1 };
    const a = buildAchievements(hist, pdfWorks, true);
    const get = (id: string) => a.find((x) => x.id === id)!;
    expect(get("first").unlocked).toBe(true);
    expect(get("five").unlocked).toBe(true);
    expect(get("ten").unlocked).toBe(false);
    expect(get("explorer").unlocked).toBe(false); // one series only
    expect(get("sao").progress).toBe(5);
    expect(get("sao").max).toBe(28);
    expect(get("member").unlocked).toBe(true);
  });
});
