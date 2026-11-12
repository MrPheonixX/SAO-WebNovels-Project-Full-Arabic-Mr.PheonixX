import { describe, it, expect } from "vitest";
import { resolveWork } from "./readerRoutes";

describe("resolveWork", () => {
  it("finds every SAO volume 1-28 and every Progressive volume 1-8", () => {
    for (let n = 1; n <= 28; n++) {
      const w = resolveWork("sao", String(n));
      expect(w?.series).toBe("Sword Art Online");
      expect(w?.volumeNumber).toBe(n);
    }
    for (let n = 1; n <= 8; n++) {
      expect(resolveWork("progressive", String(n))?.id).toBe(`sao-progressive-vol-0${n}`);
    }
  });
  it("has no PDF for volumes that do not exist", () => {
    expect(resolveWork("sao", "29")).toBe(undefined);
    expect(resolveWork("progressive", "9")).toBe(undefined);
    expect(resolveWork("sao", "abc")).toBe(undefined);
    expect(resolveWork("sao", "1e2")).toBe(undefined);
  });
  it("maps the side-works ids to the catalog", () => {
    expect(resolveWork("sidework", "nhk")?.id).toBe("welcome-to-nhk");
    expect(resolveWork("sidework", "no-longer-human")?.id).toBe("no-longer-human-dazai");
    expect(resolveWork("sidework", "sao-side-stories")?.id).toBe("sao-side-stories");
    expect(resolveWork("sidework", "nope")).toBe(undefined);
  });
  it("has nothing for sections without PDFs yet", () => {
    expect(resolveWork("lightnovel", "1")).toBe(undefined);
    expect(resolveWork("classic", "x")).toBe(undefined);
    expect(resolveWork("anime", "x")).toBe(undefined);
    expect(resolveWork(undefined, "1")).toBe(undefined);
  });
});
