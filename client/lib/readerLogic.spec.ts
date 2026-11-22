import { describe, it, expect } from "vitest";
import {
  DEFAULT_PREFS,
  buildSpreads,
  clampPage,
  imageFilter,
  keyDirection,
  sanitizePrefs,
  scrollPageWidth,
  spreadOfPage,
  spreadPage,
  swipeDirection,
  toggleBookmarkList,
} from "./readerLogic";

describe("preferences", () => {
  it("falls back to defaults for junk and clamps values", () => {
    expect(sanitizePrefs(null)).toEqual(DEFAULT_PREFS);
    expect(sanitizePrefs("x")).toEqual(DEFAULT_PREFS);
    const p = sanitizePrefs({ mode: "book", theme: "nope", zoomIndex: 99, brightness: 5, fontSize: 3, fontFamily: "amiri", rtl: false, sound: false });
    expect([p.sound]).toEqual([false]);
    expect([p.mode, p.theme, p.zoomIndex, p.brightness, p.fontSize, p.fontFamily, p.rtl]).toEqual(["book", "day", 7, 1.3, 14, "amiri", false]);
  });
});

describe("pages", () => {
  it("keeps the page inside the book", () => {
    expect(clampPage(0, 10)).toBe(1);
    expect(clampPage(99, 10)).toBe(10);
    expect(clampPage(NaN, 10)).toBe(1);
    expect(clampPage(5.6, 10)).toBe(6);
  });
});

describe("book spreads", () => {
  it("shows the cover alone, then pairs", () => {
    expect(buildSpreads(5)).toEqual([{ later: 1 }, { earlier: 2, later: 3 }, { earlier: 4, later: 5 }]);
    expect(buildSpreads(4)).toEqual([{ later: 1 }, { earlier: 2, later: 3 }, { earlier: 4 }]);
    expect(buildSpreads(0)).toEqual([]);
  });
  it("single-page spreads for narrow screens", () => {
    expect(buildSpreads(3, true)).toEqual([{ later: 1 }, { later: 2 }, { later: 3 }]);
  });
  it("finds the spread of a page", () => {
    const s = buildSpreads(9);
    expect(spreadOfPage(s, 1)).toBe(0);
    expect(spreadOfPage(s, 2)).toBe(1);
    expect(spreadOfPage(s, 3)).toBe(1);
    expect(spreadOfPage(s, 9)).toBe(4);
    expect(spreadPage(s[1])).toBe(2);
  });
});

describe("direction", () => {
  it("arrow keys follow the reading direction", () => {
    expect(keyDirection("ArrowLeft", true)).toBe(1);
    expect(keyDirection("ArrowRight", true)).toBe(-1);
    expect(keyDirection("ArrowLeft", false)).toBe(-1);
    expect(keyDirection("ArrowRight", false)).toBe(1);
    expect(keyDirection("PageDown", true)).toBe(1);
    expect(keyDirection("a", true)).toBe(0);
  });
  it("swipes follow the reading direction and ignore small movements", () => {
    expect(swipeDirection(100, true)).toBe(1); // Arabic book: pull the page to the right -> next
    expect(swipeDirection(-100, true)).toBe(-1);
    expect(swipeDirection(-100, false)).toBe(1); // left-to-right book: pull to the left -> next
    expect(swipeDirection(100, false)).toBe(-1);
    expect(swipeDirection(20, true)).toBe(0);
  });
});

describe("appearance", () => {
  it("builds the image filter", () => {
    expect(imageFilter("day", 1)).toBe("none");
    expect(imageFilter("day", 0.8)).toBe("brightness(0.8)");
    expect(imageFilter("night", 1).startsWith("invert(1)")).toBe(true);
    expect(imageFilter("sepia", 1).startsWith("sepia(")).toBe(true);
  });
  it("sizes the scroll pages", () => {
    expect(scrollPageWidth(1400, 2)).toBe(860);
    expect(scrollPageWidth(390, 2)).toBe(366);
    expect(scrollPageWidth(390, 4)).toBe(549);
  });
});

describe("bookmarks", () => {
  it("adds in page order and removes on a second toggle", () => {
    let l = toggleBookmarkList([], 9, "t");
    l = toggleBookmarkList(l, 3, "t");
    expect(l.map((b) => b.page)).toEqual([3, 9]);
    l = toggleBookmarkList(l, 3, "t");
    expect(l.map((b) => b.page)).toEqual([9]);
  });
});
