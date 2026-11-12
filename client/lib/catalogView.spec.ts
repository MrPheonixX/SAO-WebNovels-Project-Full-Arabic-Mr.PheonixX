import { describe, it, expect } from "vitest";
import { filterAndSort, seriesArcs, seriesVolumes } from "./catalogView";

const none = new Set<string>();
const base = { query: "", arc: "all", filter: "all" as const, sort: "order" as const, opened: none, isHidden: () => false };

describe("series volumes", () => {
  it("lists the 28 real SAO volumes in order and the 8 Progressive volumes", () => {
    const sao = seriesVolumes("Sword Art Online");
    const numbered = sao.filter((w) => w.volumeNumber).map((w) => w.volumeNumber);
    expect(numbered.slice(0, 28)).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
    expect(seriesVolumes("Sword Art Online Progressive").length).toBe(8);
  });
  it("finds the arcs in order of appearance", () => {
    expect(seriesArcs(seriesVolumes("Sword Art Online"))[0]).toBe("Aincrad");
  });
});

describe("filterAndSort", () => {
  const sao = seriesVolumes("Sword Art Online");
  it("filters by arc and by search text (Arabic or English)", () => {
    expect(filterAndSort(sao, { ...base, arc: "Aincrad" }).length).toBe(2);
    expect(filterAndSort(sao, { ...base, query: "alicization" }).length > 5).toBe(true);
    expect(filterAndSort(sao, { ...base, query: "zzzz-no-match" }).length).toBe(0);
  });
  it("search still works together with the opened/unread filters", () => {
    const opened = new Set([sao[0].id]);
    const r = filterAndSort(sao, { ...base, opened, filter: "opened" });
    expect(r.map((w) => w.id)).toEqual([sao[0].id]);
    const u = filterAndSort(sao, { ...base, opened, filter: "unread", arc: "Aincrad" });
    expect(u.length).toBe(1);
  });
  it("hides works the admin hid, and sorts by rating without changing the source", () => {
    const hidden = sao[0].id;
    const r = filterAndSort(sao, { ...base, isHidden: (id) => id === hidden, sort: "rating" });
    expect(r.some((w) => w.id === hidden)).toBe(false);
    for (let i = 1; i < r.length; i++) expect((r[i - 1].rating ?? 0) >= (r[i].rating ?? 0)).toBe(true);
    expect(sao[0].id).toBe(hidden);
  });
});
