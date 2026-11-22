import { describe, it, expect } from "vitest";
import {
  __setBooksIndexForTests,
  getBookInfo,
  isBookReadable,
  pageRatio,
  pageUrl,
  thumbUrl,
  coverUrl,
} from "./books";

const info = { pages: 4, width: 900, ratio: 1.4, odd: { "1": 1.7 }, kinds: "cggg", text: true, cover: true };

describe("books index", () => {
  it("is unknown until loaded, then tells which books are ready", () => {
    __setBooksIndexForTests(null);
    expect(isBookReadable("a")).toBe(null);
    __setBooksIndexForTests({ generatedAt: "x", books: { a: info } });
    expect(isBookReadable("a")).toBe(true);
    expect(isBookReadable("b")).toBe(false);
    expect(getBookInfo("a")?.pages).toBe(4);
  });
  it("builds the page, thumbnail and cover addresses", () => {
    expect(pageUrl("a", info, 1)).toBe("/books/a/p-0001.webp"); // colour page
    expect(pageUrl("a", info, 2)).toBe("/books/a/p-0002.png"); // grayscale page
    expect(thumbUrl("a", 12)).toBe("/books/a/t-0012.webp");
    expect(coverUrl("a")).toBe("/books/a/cover.webp");
  });
  it("uses the page's own shape when it differs", () => {
    expect(pageRatio(info, 1)).toBe(1.7);
    expect(pageRatio(info, 2)).toBe(1.4);
  });
});
